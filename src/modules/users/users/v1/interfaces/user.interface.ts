export interface IUserProfile {
  id: string;
  fullname: string;
  email: string;
  phone: string;
  phoneCode: string;
  gender: string;
  dob: string;
  profilePic: string | null;
  isVerified: boolean;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
}