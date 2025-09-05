import { TeamMemberRole } from "#modules/teams/team-members.model";
import { redisClient } from "#config/redis";

export function parseInviteLink(link: string): { role: TeamMemberRole; teamId: string,uuid:string } | null {
    try {
        const url = new URL(link)
        const parts = url.pathname.split("/").filter(Boolean)

        // ожидаем структуру: ["invite", role, teamId, uuid]
        if (parts.length < 4 || parts[0] !== "invite") {
            return null
        }

        const role = parts[1]
        if (!Object.values(TeamMemberRole).includes(role as TeamMemberRole)) {
            return null;
        }
        const teamId = parts[2]
        const uuid = parts[3]
        
        return { role:role as TeamMemberRole, teamId,uuid }
    } catch (e) {
        return null
    }
}

export async function getAllInviteLinks(teamId: string): Promise<string[]> {
    const pattern = `inviteLink:${teamId}:*`
    let cursor = "0"
    const results: string[] = []

    do {
        const reply = await redisClient.scan(cursor, { MATCH: pattern, COUNT: 100 })
        cursor = reply.cursor
        if (reply.keys.length > 0) {
            const values = await redisClient.mGet(reply.keys)
            results.push(...(values.filter(Boolean) as string[]))
        }
    } while (cursor !== "0")

    return results;
}
