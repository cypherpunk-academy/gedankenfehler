export type ReactionType =
    | 'wut'
    | 'inspiration'
    | 'ablehnung'
    | 'zustimmung'
    | 'interesse';

export type Reaction = {
    type: ReactionType;
    color: string;
    count: number | null;
};
