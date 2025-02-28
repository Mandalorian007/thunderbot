export interface Clan {
    id: string;
    name: string;
    description: string;
    roleId: string;
    approverRoleId: string;
    approvalChannelId: string;
}

export interface ClanConfig {
    clans: Clan[];
}

export type ClanRequestAction = 'accept' | 'deny'; 