import { BaseRepository } from "#classes/base-repository";
import { TeamMember, ITeamMember } from "#modules/teams/team-members.model";
import { redisClient } from "#config/redis";

class TeamMemberRepository extends BaseRepository<ITeamMember> {
    constructor() {
        super(TeamMember, "team_member:");
    }

    async findByUserId(userId: string) {
        const key = this.getCacheKey(`user:${userId}`);

        const cached = await redisClient.get(key);
        if (cached) {
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
            const parsed = JSON.parse(cached);
            return parsed.map((doc: any) => this.model.hydrate(doc)) as ITeamMember[];
        }

        const records = await this.model.find({ team_id: teamId });
        if (records.length > 0) {
            await redisClient.set(key, JSON.stringify(records.map(r => r.toObject())));
        }

        return records;
    }
    async updateByUserId(userId: string, data: Partial<ITeamMember>): Promise<ITeamMember | null> {
        const result = await this.model
            .findOneAndUpdate({ member_id: userId }, data, { new: true, runValidators: true })
            .exec();

        if (result) {
            await this.invalidateCache(userId);
        }

        return result;
    }

    async updateByTeamId(teamId: string, data: Partial<ITeamMember>): Promise<ITeamMember | null> {
        const result = await this.model
            .findOneAndUpdate({ team_id: teamId }, data, { new: true, runValidators: true })
            .exec();

        if (result) {
            await this.invalidateCache(teamId);
        }

        return result;
    }
}

export const teamMemberRepository = new TeamMemberRepository();
