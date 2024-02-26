import { OpenAI } from "openai";
import fs, { write } from "fs";
import path from "path"

import { configDotenv } from "dotenv";

configDotenv({ path: "/opt/ai/.env" })

// // load api secrets
const apiKey = process.env.OPENAI_API_KEY;

// // visually verify key
// console.log(apiKey)

// load working dir
const dir = process.env.AI_WORKING_DIR;

// do not take empty value for apiKey
if (apiKey.length > 0) {
  // prepare list of chat capable models
  const models = [
    "gpt-3.5-turbo",
    "gpt-3.5-turbo-0301",
    "gpt-3.5-turbo-0613",
    "gpt-3.5-turbo-16k",
    "gpt-3.5-turbo-16k-0613",
  ];

  // parse request file
  const reqfile = path.join(dir, process.env.AI_REQUEST);

  // do not take not existing import json file
  let isFile = fs.lstatSync(reqfile).isFile();
  if (isFile) {
    // parse docs to capture
    const request = JSON.parse(fs.readFileSync(reqfile));

    // retrieve files array
    const { prompt } = request;

    // initate the messages array
    const messages = [];

    if (prompt.length > 0) {
      messages.push({ role: "user", content: prompt });
    }

    // prepare the gpt model for the biggest context to generate the code;
    let model = "gpt-3.5-turbo-16k";

    // prepare char count
    let charcount = 0;

    // loop messages
    messages.forEach((message) => {
      // get char count for message
      let charsInMessage = Object.values(message)[1].length;
      // sum the chars
      charcount += charsInMessage;
    });
    // exit count chars in messages loop

    // calculate tokens needed for input
    const tokens = Math.ceil(charcount / 4);

    // // log total chars
    // console.log(`total chars: ${charcount}`);

    // // log needed tokens projection
    // console.log(`tokens: ${tokens}`);

    // set a treshold for not much context
    if (tokens < 3800) {
      // use a more budget friendly gpt model if not much context is provided.
      model = "gpt-3.5-turbo";
    }

    // const body = {
    //   messages: [{ role: 'user', content: 'Say this is a test' }],
    //   model: 'gpt-3.5-turbo',
    // };

    const body = {
      messages,
      model
    }

    // // visually verify body request
    // console.log(body);

    // record start time
    const startTime = Date.now();

    const openai = new OpenAI()

    //   call openai gpt-3.5-turbo
    async function main() {

      try {
        const chatCompletion = await openai.chat.completions.create(body);

        // record stop time
        const endTime = Date.now();

        // get the difference btw the start and end time.
        const diff = endTime - startTime;

        // divide that by one thousand because the value it's in miliseconds.
        const seconds = diff / 1000;

        // store finish reason
        const finish = chatCompletion.choices[0].finish_reason;

        // store message from gpt
        const completion_text = chatCompletion.choices[0].message.content;

        // retrieve token counts
        const { prompt_tokens, completion_tokens } = chatCompletion.usage;

        const cost =
          (prompt_tokens / 1000) * 0.0015 + (completion_tokens / 1000) * 0.002;

        // log the output directly to console.
        console.log(completion_text);
      } catch (error) {
        if (error.response) {
          console.log(error.response.status);
          console.log(error.response.data);
        } else {
          console.log(error.message);
        }
      }
    }
    main();
    // end of openai async call
  }
  // fi validate req.json exists
}
// fi validate apiKey is not empty
