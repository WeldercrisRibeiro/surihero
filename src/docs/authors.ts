export interface Author {
  id: string;
  name: string;
  linkedin?: string;
  role?: string;
}

export const AUTHORS: Record<string, Author> = {
  welder: {
    id: 'welder',
    name: 'Welder Ribeiro',
    role: 'Customer Success Analyst',
  }
};
