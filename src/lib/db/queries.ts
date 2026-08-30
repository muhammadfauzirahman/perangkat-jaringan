import { isNull } from "drizzle-orm";
import { perangkat } from "./schema";

export const notDeleted = () => isNull(perangkat.deletedAt);