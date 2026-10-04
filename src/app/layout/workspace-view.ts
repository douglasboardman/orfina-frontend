export type WorkspaceView =
  | 'overview'
  | 'accounts'
  | 'cards'
  | 'categories'
  | 'transactions'
  | 'recurrences'
  | 'budget'
  | 'goals'
  | 'transfers'
  | 'imports'
  | 'profile'
  | 'group';

export type NavigableWorkspaceView = Exclude<WorkspaceView, 'profile' | 'group'>;
