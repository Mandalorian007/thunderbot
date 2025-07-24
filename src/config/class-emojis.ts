/**
 * Diablo Immortal Class App Emojis
 * These are app emojis owned by the Thunder Bot application
 * Format: <:name:id>
 */

export const ClassEmojis = {
  barbarian: '<:barbarian:1398056788141801522>',
  bloodknight: '<:bloodknight:1398056772203319356>',
  crusader: '<:crusader:1398056706197688480>',
  demonhunter: '<:demonhunter:1398056691588923463>',
  druid: '<:druid:1398056673649627156>',
  monk: '<:monk:1398056656897839104>',
  necromancer: '<:necromancer:1398056639352803450>',
  tempest: '<:tempest:1398056622470725762>',
  wizard: '<:wizard:1398056598009675927>'
} as const;

/**
 * Map of class names to their display names
 */
export const ClassDisplayNames = {
  barbarian: 'Barbarian',
  bloodknight: 'Blood Knight',
  crusader: 'Crusader',
  demonhunter: 'Demon Hunter',
  druid: 'Druid',
  monk: 'Monk',
  necromancer: 'Necromancer',
  tempest: 'Tempest',
  wizard: 'Wizard'
} as const;

/**
 * Array of all available class keys
 */
export const ClassKeys = Object.keys(ClassEmojis) as Array<keyof typeof ClassEmojis>;

/**
 * Get emoji string for a class
 * @param className - The class name (lowercase)
 * @returns The Discord emoji string
 */
export function getClassEmoji(className: keyof typeof ClassEmojis): string {
  return ClassEmojis[className];
}

/**
 * Get display name for a class
 * @param className - The class name (lowercase)
 * @returns The formatted display name
 */
export function getClassDisplayName(className: keyof typeof ClassEmojis): string {
  return ClassDisplayNames[className];
}

/**
 * Get emoji and display name together
 * @param className - The class name (lowercase)
 * @returns Formatted string with emoji and name
 */
export function getClassWithEmoji(className: keyof typeof ClassEmojis): string {
  return `${ClassEmojis[className]} ${ClassDisplayNames[className]}`;
}

/**
 * Type for valid class names
 */
export type ClassName = keyof typeof ClassEmojis; 