import { createContext } from "react";
import {UsersDetail} from "@/app/provider";

export type UserDetail={
  name:string,
  email:string,
  credits:number
}

export const UserDetailContext=createContext<any>(undefined);