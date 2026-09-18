import express, { type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const API_KEY = process.env.API_KEY ?? "";
const FOOTBALL_DATA_API_BASE_URL =
  process.env.FOOTBALL_DATA_API_BASE_URL;

app.use(
  cors()
);

app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.send("Backend is running");
});

const getTeamsHandler = async (req: Request, res: Response) => {
  const season = Number(req.body?.season ?? req.query.season);

  if (!Number.isInteger(season) || season <= 0) {
    return res.status(400).json({
      error: "A valid season is required in the request body or query string.",
    });
  }

  if (!API_KEY) {
    return res.status(500).json({
      error: "Missing API_KEY in backend environment variables.",
    });
  }

  try {
    const url = `${FOOTBALL_DATA_API_BASE_URL}/competitions/CL/teams?season=${season}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Auth-Token": API_KEY,
        Accept: "application/json",
      },
    });

    const rawText = await response.text();
    if (!response.ok) {
      return res.status(response.status).json({
        error: "Football Data API request failed.",
        details: rawText,
      });
    }

    const data: any = JSON.parse(rawText)
    const teamData = Array.isArray(data)
      ? data
      : data && typeof data === "object" && "teams" in data
        ? data.teams
        : [];

    const teams = Array.isArray(teamData)
      ? teamData.map((team: any) => ({
          id: String(team.id),
          name: team.name,
          shortName: team.shortName,
          crestUrl: team.crestUrl,
        }))
      : [];

    return res.json({ teams });
  } catch (error) {
    console.error("Error fetching UCL teams:", error);
    return res.status(500).json({
      error: "Failed to fetch UCL teams.",
    });
  }
};

app.post("/getTeams", getTeamsHandler);

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});