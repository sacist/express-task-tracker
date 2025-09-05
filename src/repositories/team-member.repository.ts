import { BaseRepository } from "#classes/base-repository";
import { TeamMember, ITeamMember,TeamMemberRole } from "#modules/teams/team-members.model";
import { redisClient } from "#config/redis";
import { Types } from "mongoose";

class TeamMemberRepository extends BaseRepository<ITeamMember> {
    constructor() {
        super(TeamMember, "team_member:");
    }

    private async invalidateMemberCaches(memberId: string, teamId: string) {
        await Promise.all([
            redisClient.del(this.getCacheKey(`team:${memberId}`)),
            redisClient.del(this.getCacheKey(`team:${teamId}`)),
        ]);
    }

    async findByUserId(userId: string) {
        const key = this.getCacheKey(`team:${userId}`);

        const cached = await redisClient.get(key);
        if (cached) {
            console.log("кэш тим по userId");
            const parsed = JSON.parse(cached);
            return parsed.map((doc: any) => this.model.hydrate(doc)) as ITeamMember[];
        }

        const records = await this.model.find({ member_id: userId });
        if (records.length > 0) {
            await redisClient.set(key, JSON.stringify(records.map(r => r.toObject())));
        }

        return records;
    }

    async findByTeamId(teamId: string) {
        const key = this.getCacheKey(`team:${teamId}`);

        const cached = await redisClient.get(key);
        if (cached) {
            console.log("кэш тим по teamId");
            const parsed = JSON.parse(cached);
            return parsed.map((doc: any) => this.model.hydrate(doc)) as ITeamMember[];
        }

        const records = await this.model.find({ team_id: teamId });
        if (records.length > 0) {
            await redisClient.set(key, JSON.stringify(records.map(r => r.toObject())));
        }

        return records;
    }

    async createMember(data: { member_id: string; team_id: string; role: TeamMemberRole }) {
        const record = await this.model.create({
            member_id: new Types.ObjectId(data.member_id),
            team_id: new Types.ObjectId(data.team_id),
            role: data.role,
        });

        await this.invalidateMemberCaches(data.member_id, data.team_id);

        return record;
    }

    async updateByUserId(userId: string, data: Partial<ITeamMember>): Promise<ITeamMember | null> {
        const result = await this.model
            .findOneAndUpdate({ member_id: userId }, data, { new: true, runValidators: true })
            .exec();

        if (result) {
            await this.invalidateMemberCaches(userId, result.team_id.toString());
        }

        return result;
    }

    async updateByTeamId(teamId: string, data: Partial<ITeamMember>): Promise<ITeamMember | null> {
        const result = await this.model
            .findOneAndUpdate({ team_id: teamId }, data, { new: true, runValidators: true })
            .exec();

        if (result) {
            await this.invalidateMemberCaches(result.member_id.toString(), teamId);
        }

        return result;
    }
}


export const teamMemberRepository = new TeamMemberRepository();
