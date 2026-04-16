import { IParseResult } from "./types";

export function parseBulkFile(content: string): IParseResult {
        const lines = content.split(/\r?\n/).filter((l) => l.trim() !== "");
        const result: IParseResult = {
                organizations: [],
                drivers: [],
                sponsors: [],
                errors: [],
        };

        for (let i = 0; i < lines.length; i++) {
                const lineNum = i + 1;
                const raw = lines[i];
                const fields = raw.split("|");
                const type = fields[0]?.trim().toUpperCase();

                if (!["O", "D", "S"].includes(type)) {
                        result.errors.push({
                                line: lineNum,
                                raw,
                                message: `Invalid type "${fields[0]?.trim() || "(empty)"}". Must be O, D, or S.`,
                        });
                        continue;
                }

                if (type === "O") {
                        const orgName = fields[1]?.trim();
                        if (!orgName) {
                                result.errors.push({
                                        line: lineNum,
                                        raw,
                                        message: "Organization name is missing.",
                                });
                                continue;
                        }
                        result.organizations.push({ line: lineNum, name: orgName });
                        continue;
                }

                // D or S
                const orgName = fields[1]?.trim() || "";
                const firstName = fields[2]?.trim() || "";
                const lastName = fields[3]?.trim() || "";
                const email = fields[4]?.trim() || "";
                const pointsRaw = fields[5]?.trim();
                const reason = fields[6]?.trim();

                if (!firstName || !lastName || !email) {
                        result.errors.push({
                                line: lineNum,
                                raw,
                                message: "First name, last name, and email are required.",
                        });
                        continue;
                }

                // If points present, reason must also be present
                const points =
                        pointsRaw && pointsRaw !== "" ? Number(pointsRaw) : undefined;
                if (points !== undefined && isNaN(points)) {
                        result.errors.push({
                                line: lineNum,
                                raw,
                                message: `Invalid points value "${pointsRaw}".`,
                        });
                        continue;
                }
                if (points !== undefined && (!reason || reason === "")) {
                        result.errors.push({
                                line: lineNum,
                                raw,
                                message:
                                        "Points are present but reason for points is missing.",
                        });
                        continue;
                }

                // Sponsor users cannot have points (admin context — rule C defers to sponsor rule 3 for sponsors only)
                if (type === "S" && points !== undefined) {
                        result.errors.push({
                                line: lineNum,
                                raw,
                                message:
                                        "Points cannot be assigned to Sponsor users. They will be ignored; user will still be created.",
                        });
                        // Still add the sponsor but strip points
                        result.sponsors.push({
                                line: lineNum,
                                type: "S",
                                orgName,
                                firstName,
                                lastName,
                                email,
                        });
                        continue;
                }

                const entry: IParseResult['drivers'][number] = {
                        line: lineNum,
                        type: type as "D" | "S",
                        orgName,
                        firstName,
                        lastName,
                        email,
                        ...(points !== undefined ? { points, reason } : {}),
                };

                if (type === "D") result.drivers.push(entry);
                else result.sponsors.push(entry);
        }

        return result;
}
