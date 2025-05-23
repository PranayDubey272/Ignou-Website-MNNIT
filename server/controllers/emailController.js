import db from "../database.js";
import nodemailer from "nodemailer";
import cron from "node-cron";

async function sendEmail(email, name, subject, body) {
  try {
    console.log("inside try");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.WORD,
      },
    });

    console.log("email sent ", email);

    let info = await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: subject,
      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #1a1a1a; /* Dark background color */
            color: #fff; /* Text color */
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff; /* Container background color */
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0px 0px 10px rgba(255, 255, 255, 0.1);
          }
          h2, h3 {
            color: black;
            text-align: center; /* Center align heading */
          }
          .logo {
            text-align: center;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <img src="http://ignou.ac.in/images/logo.png" alt="Logo" style="height: 80px;">
          </div>
          <h2>Hello👋, ${name} </h2>
          <h3>MNNIT-IGNOU</h3>
          <h2>${body} </h2>
        </div>
      </body>
      </html>`,
    });

    return "success";
  } catch (error) {
    return error.message;
  }
}

export const sendEmailToSelectedUsers = async (req, res) => {
  try {
    let { subject, body, programme, semester, session, year } = req.body;
    const updatedProgramme = programme + semester;
    programme = updatedProgramme;
    console.log(subject,body,programme,semester,session,year);
    console.log(programme);

    const { rows } = await db.query(
      "SELECT name, email FROM users WHERE programme = $1 AND session = $2 AND year = $3",
      [programme, session, year]
    );

    console.log("server--->", session, year);

    const usersWithEmailAndName = rows.map((user) => ({
      name: user.name,
      email: user.email,
    }));
    console.log("users: ",usersWithEmailAndName);
    for (const user of usersWithEmailAndName) {
      try {
        const result = await sendEmail(user.email, user.name, subject, body);
        console.log("server--->", result);
      } catch (err) {
        console.log("Error in mail function", err.message);
      }
    }

    return res.json({
      status: "success",
      message: "Mail sent to selected students!",
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendWelcomeEmail = async (to, name) => {
  const subject = "Welcome to the New Semester!";
  const body = `
    Dear ${name},

    Welcome to your first semester! We are excited to have you join us.

    This email confirms your successful registration in our system. 
    Please keep this email for future reference.

    If you have any questions, feel free to reach out to the admin office.

    Best regards,  
    Academic Affairs Team
  `;

  try {
    const result = await sendEmail(to, name, subject, body);
    return result;
  } catch (err) {
    console.error(`Failed to send welcome email to ${to}:`, err.message);
    throw err;
  }
};

export const scheduleDeadlineReminders = async () => {
  console.log("⏳ Scheduling deadline reminder cron job...");

  cron.schedule("0 * * * *", async () => {
    console.log(" Running deadline reminder check...");

    try {
      const { rows } = await db.query(`
        SELECT u.name, u.email, a.assignment_name, a.deadline
        FROM assignments a
        JOIN user_courses uc ON uc.course_id = a.course_id
        JOIN users u ON u.registration_no = uc.registration_no
        WHERE a.deadline BETWEEN NOW() AND NOW() + INTERVAL '24 HOURS'
      `);      

      if (rows.length === 0) {
        console.log(" No deadlines in next 24 hours.");
        return;
      }

      for (const user of rows) {
        const subject = ` Reminder: "${user.assignment_name}" is due soon`;
        const body = `
          Hello ${user.name},

          This is a reminder that your assignment "${user.assignment_name}" is due by 
          ${new Date(user.deadline).toLocaleString()}.

          Please ensure timely submission.

          Best of luck!  
          MNNIT-IGNOU Team
        `;

        try {
          const result = await sendEmail(user.email, user.name, subject, body);
          console.log(` Reminder sent to ${user.email}: ${result}`);
        } catch (err) {
          console.error(` Failed to send to ${user.email}:`, err.message);
        }
      }
    } catch (err) {
      console.error("❗ Error fetching assignment reminders:", err.message);
    }
  });
};



export default sendWelcomeEmail;
