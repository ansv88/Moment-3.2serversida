const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

//Init express
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

//Anslut till databasen
mongoose
  .connect(process.env.DATABASE)
  .then(() => {
    console.log("Ansluten till MongoDB");
  })
  .catch((error) => {
    console.log("Fel vid anslutning: " + error);
  });

//Workexperience Schema
const WorkexperienceSchema = new mongoose.Schema({
  companyname: {
    type: String,
    required: [true, "Du måste ange arbetsplats"],
  },
  jobtitle: {
    type: String,
    required: [true, "Du måste ange befattning/yrkesroll"],
  },
  location: {
    type: String,
    required: [true, "Du måste ange arbetsort"],
  },
  description: {
    type: String,
    required: [true, "Du måste ange arbetsbeskrivning/arbetsuppgifter"],
  },
  start_date: {
    type: Date,
    required: [true, "Du måste ange startdatum för anställning"],
  },
  end_date: {
    type: Date,
    required: false,
  },
});

//Skapa en modell
const Workexperience = mongoose.model("workexperience", WorkexperienceSchema);

// Routes //

//Läs ut från databasen
app.get("/dt207g/workexperiences", async (req, res) => {
  try {
    //Hämta data från databasen och sortera den i fallande ordning efter id
    let result = await Workexperience.find({}).sort({ id: -1 });

    //Kontrollera om resultatet är tomt
    if (!result.length) {
      return res
        .status(404)
        .json({ error: "Ingen arbetslivserfarenhet hittades." }); //Svar med statuskod och felmeddelande
    }

    //Om databasfrågan fungerar som den ska, returnera statuskod samt datan från servern
    return res.status(200).json(result);
  } catch (error) {
    console.error("Fel vid databasfråga: ", error); //Logga felmeddelande
    return res
      .status(500)
      .json({ error: "Internt serverfel. Kontrollera loggar." }); //Svar med statuskod och felmeddelande
  }
});

//Lägg till ny arbetslivserfarenhet
app.post("/workexperience", async (req, res) => {
  //Skapa variabler med data från formuläret
  const companyname = (req.body.companyname || "").trim();
  const jobtitle = (req.body.jobtitle || "").trim();
  const location = (req.body.location || "").trim();
  const description = (req.body.description || "").trim();
  const start_date_str = req.body.start_date;
  const end_date_str = req.body.end_date;

  let errors = []; //Variabel med tom array för att lagra ev felmeddelanden i

  // Validering och felmeddelande för textinmatningarna //
  if (companyname === "") {
    errors.push("Ange en arbetsgivare/arbetsplats");
  }
  if (jobtitle === "") {
    errors.push("Ange en jobbtitel");
  }
  if (location === "") {
    errors.push("Ange en arbetsort");
  }
  if (description === "") {
    errors.push("Ange en beskrivning av jobbet");
  }

  // Validering och felmeddelanden för datum //
  //Validera startdatumet
  if (!start_date_str || isNaN(Date.parse(start_date_str))) {
    errors.push("Ogiltigt format på startdatum");
  }

  //Skapa variabel med Date-objekt om startdatumet är giltigt
  const start_date = new Date(start_date_str);

  //Variabel för slutdatumet
  let end_date;

  //Kontrollera om det finns ett slutdatum och validera det
  if (end_date_str) {
    if (isNaN(Date.parse(end_date_str))) {
      errors.push("Ogiltigt format på slutdatum");
    } else {
      //Skapa ett Date-objekt för slutdatumet
      end_date = new Date(end_date_str);
    }
  }

  //Om både startdatum och slutdatum finns, får inte startdatumet vara senare än slutdatumet
  if (end_date && start_date > end_date) {
    errors.push("Startdatum kan inte vara senare än slutdatum");
  }

  //Kontrollera om det finns några fel i listan
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  //Lagra i databasen och hantera eventuella fel där
  try {
    let result = await Workexperience.create({
      companyname,
      jobtitle,
      location,
      description,
      start_date,
      end_date: end_date || null,
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error("Fel vid skapande av arbetslivserfarenhet: ", error);
    return res.status(500).json({ error: "Internt serverfel" });
  }
});

app.put("/workexperience/:id", async (req, res) => {
    const workid = req.params.id;
    const { companyname, jobtitle, location, start_date, end_date, description } = req.body;

    //Skapa ett tomt objekt för att lagra uppdateringar
    const updates = {};

    //Funktion för att lägga till uppdateringar om fälten inte är undefined
    function addUpdate(field, value) {
        if (value !== undefined) {
            updates[field] = value;
        }
    }

    //Kör funktionen med uppdateringar för varje fält
    addUpdate('companyname', companyname);
    addUpdate('jobtitle', jobtitle);
    addUpdate('location', location);
    addUpdate('start_date', start_date);
    addUpdate('end_date', end_date);
    addUpdate('description', description);

    //Om inga uppdateringar har gjorts, returnera ett fel
    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "Inga uppdateringar är gjorda." });
    }

    try {
        //Försök att uppdatera dokumentet i MongoDB
        const result = await Workexperience.findByIdAndUpdate(workid, updates, { new: true });

        //Om inga dokument uppdaterades (dokumentet med angivet ID hittades inte)
        if (!result) {
            return res.status(404).json({ error: "Arbetslivserfarenhet med angivet ID hittades inte." });
        }

        //Om uppdateringen fungerade, skicka 200-status och mer info om det uppdaterade jobbet
        res.status(200).json({
            message: "Arbetslivserfarenhet uppdaterades.",
            updatedJob: result
        });
    } catch (error) {
        //Logga och hantera eventuella fel vid databasanrop med 500-status och meddelande
        console.error("Fel vid uppdatering av arbetslivserfarenhet: ", error);
        res.status(500).json({ error: "Internt serverfel. Kontrollera loggar." });
    }
});

//Ta bort en arbetslivserfarenhet
app.delete("/workexperience/:id", async (req, res) => {
    const workid = req.params.id;  //Hämta id

    //Försök radera arbetslivserfarenheten från databasen
    try {
        //Försök att hitta och radera arbetslivserfarenheten från databasen
        const result = await Workexperience.findByIdAndDelete(workid);

        //Om inget dokument hittades med angivet ID, skicka 404-status och meddelande
        if (!result) {
            return res.status(404).json({ error: "Arbetslivserfarenhet med angivet ID hittades inte." });
        }

        //Raderingen lyckades, skicka bekräftelse
        res.status(200).json({ message: "Arbetslivserfarenhet borttagen"});
    } catch (error) {
        //Logga och hantera eventuella fel vid databasfrågan med 500-status och meddelande
        console.error("Fel vid databasfråga: ", error);
        res.status(500).json({ error: "Internt serverfel. Kontrollera loggar." });
    }
});

app.listen(port, () => {
  console.log("Servern körs på port: " + port);
});
