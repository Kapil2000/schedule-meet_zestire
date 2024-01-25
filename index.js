import dotenv from "dotenv";
dotenv.config({});
import express from "express";
import { google } from "googleapis";
import dayjs from "dayjs";
import { v4 as uuid } from "uuid";

const calendar = google.calendar({
  version: "v3",
  auth: process.env.API_KEY,
});
const app = express();

const PORT = 8000;

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
);

const scopes = ["https://www.googleapis.com/auth/calender"];

app.get("/google", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });
  res.redirect(url);
});

app.get("/google/redirect", async (req, res) => {
  const code = req.query.code;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  res.send({ msg: "You have successfully loggged in" });
});

app.get("/schedule_meet", async (req, res) => {
  await calendar.events.insert({
    calendarId: "primary",
    auth: oauth2Client,
    conferenceDataVersion: 1,
    requestBody: {
      summary: "Schedule meet",
      description: "Some meet that is very important",
      start: {
        dateTime: dayjs(new Date()).add(1, "day").toISOString(),
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: dayjs(new Date()).add(1, "day").add(1, "hour").toISOString(),
        timeZone: "Asia/Kolkata",
      },
      conferenceData: {
        createRequest: {
          requestId: uuid(),
        },
      },
      attendees: [
        {
          email: "kapilt749@gmail.com",
        },
      ],
    },
  });
  res.send({ msg: "Meet is scheduled" });
});

app.listen(PORT, () => {
  console.log("Server started on Port : ", PORT);
});
