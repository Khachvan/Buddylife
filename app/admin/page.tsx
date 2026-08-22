import {requireChatGPTUser} from "../chatgpt-auth";
import AdminClient from "./admin-client";
export const dynamic="force-dynamic";
export default async function Admin(){const u=await requireChatGPTUser("/admin");if(u.email.toLowerCase()!=="khachvantsyan@gmail.com")return <main className="adminDenied"><h1>Access denied</h1></main>;return <AdminClient/>}
