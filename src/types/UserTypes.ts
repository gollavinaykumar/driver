export interface ResponseFromLogin {
  isDriverActive: boolean;
  isDriverVerified: boolean;
  token: string;
  userId: string;
  type: string;
}
