import {getDb} from "../../../db";
import {contentItems} from "../../../db/schema";
export async function GET(){try{const rows=await getDb().select().from(contentItems);return Response.json({content:Object.fromEntries(rows.map(r=>[r.contentKey,r.value]))})}catch{return Response.json({content:{}})}}
