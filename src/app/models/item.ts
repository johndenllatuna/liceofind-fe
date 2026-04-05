export interface Item {
  id: number;
  name: string;
  description: string;
  location: string;
  date: string;
  imageUrl: string;
  status: 'Available' | 'Claim Pending' | 'Settled';
}