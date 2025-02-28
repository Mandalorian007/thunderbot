import fs from 'fs';
import path from 'path';
import { ClanConfig } from '../types/clan';

export function loadClanConfig(): ClanConfig {
    const configPath = path.join(process.cwd(), 'config', 'clans.json');
    
    if (!fs.existsSync(configPath)) {
        throw new Error('Clan configuration file not found. Please create config/clans.json');
    }

    try {
        const configData = fs.readFileSync(configPath, 'utf8');
        const config: ClanConfig = JSON.parse(configData);

        // Validate the configuration
        if (!Array.isArray(config.clans)) {
            throw new Error('Invalid configuration: clans must be an array');
        }

        // Validate each clan
        config.clans.forEach((clan, index) => {
            const requiredFields = ['id', 'name', 'roleId', 'approverRoleId', 'approvalChannelId'];
            requiredFields.forEach(field => {
                if (!clan[field as keyof typeof clan]) {
                    throw new Error(`Invalid configuration: clan at index ${index} is missing ${field}`);
                }
            });
        });

        return config;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to load clan configuration: ${error.message}`);
        }
        throw new Error('Failed to load clan configuration');
    }
} 