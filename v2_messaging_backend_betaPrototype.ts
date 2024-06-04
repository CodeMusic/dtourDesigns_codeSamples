import { experimental_AssistantResponse } from "@copilotkit/backend";
import OpenAI from "openai";
import { MessageContent } from "openai/resources/beta/threads/messages/messages";
//import { parseCookies } from '_helpers/server/api/apiHelpers';
import { Guid } from "guid-typescript";
import { cookies } from 'next/headers';
import { CopilotBackend, OpenAIAdapter } from "@copilotkit/backend";
import fetch from 'node-fetch';
import { AssistantMessage, formatStreamPart } from "@copilotkit/shared";

//import { TextEncoder } from 'util';
//const { TextEncoder } = require('util');
import { TextEncoder as NodeTextEncoder } from 'util';


//import { debugLog } from '../../../_helpers/server/api/error-handler/debugLog'
export function debugLog(...messages: any[]) {
  const debugLogging: boolean = true;
  if (debugLogging) {
      console.log(...messages);
  }
}

const copilotKit = new CopilotBackend();

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

const codeMusaiAI = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
  baseURL: process.env.CODEMUSAI_BASE_URL // Set the custom base URL
});


var assistantId = "asst_ORdcRA95gS213PK4zAmUQaBs"; //asst_P3HVToUKAsCiotkZfZYiHCm9";

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

const homeTemperatures = {
  bedroom: 20,
  "home office": 21,
  "living room": 21,
  kitchen: 22,
  bathroom: 23,
};


async function loadThread(simulatedConsciousness: string, userId: string, memoryId: string, token: string, baseUrl: string) {
  const threadSettingName = `${simulatedConsciousness}.ChatThread_${memoryId}`;
  
  var settings = await getUserSettings(userId, token, baseUrl);
  debugLog('Settings:', settings);
  
  const setting = settings.find(s => s.settingName === threadSettingName);
  var threadId: string | null = null;
  if (setting) {
    threadId = setting.settingValue;
  } else {
    console.error(`No valid settings found for threadSettingName: ${threadSettingName}`);
  }
  
  return threadId;
}

async function getUserSettings(userId: string, token: string, baseUrl: string) {
  try {
    const url = `http://localhost:3000/api/usersettings/user/${userId}`;
    debugLog(`Sending GET to ${url}`);
    const response = await fetch(url, {
      headers: {
        'Cookie': `authorization=${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : []; // Ensure the return is always an array
  } catch (error) {
    console.error('Failed to fetch user settings:', error);
    return []; // Return an empty array on error
  }
}

async function getConsciousness(id: string, token: string, baseUrl: string) {
  try {
    const url = `http://localhost:3000/api/simulatedconsciousnesses/${id}`;
    debugLog(`Sending GET to ${url}`);
    const response = await fetch(url, {
      headers: {
        'Cookie': `authorization=${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    debugLog('=====> GET of Simulated Consciousness with id:', id);
    debugLog('=====> Results:', data);
    return data; // Ensure the return is always an array
  } catch (error) {
    console.error('Failed to get consciousnesss:', error);
    return '';
  }
}

async function updateConsciousness(consciousness: any, token: string, baseUrl: string) {
  try {

    consciousness.activity += 1;
    const url = `http://localhost:3000/api/simulatedconsciousnesses/${(consciousness.id as any).value.toString()}`;
    debugLog(`Sending PUT to ${url}`);
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Cookie': `authorization=${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(consciousness)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    debugLog('=====> PUT Results:', data);
    return data; // Ensure the return is always an array
  } catch (error) {
    console.error('Failed to update consciousness:', error);
    return '';
  }
}

async function saveThread(simulatedConsciousness: string, userId: string, memoryId: string, threadId: string, threadName: string, token: string, baseUrl: string) {

  if (!userId || !memoryId || !simulatedConsciousness || !threadId) {
    console.error(`Invalid parameters for saveThread: userId: ${userId}, memoryId: ${memoryId}, simulatedConsciousness: ${simulatedConsciousness}, threadId: ${threadId}`);
    return;
  }
  const threadSetting = `${simulatedConsciousness}.ChatThread_${memoryId}`;
  debugLog('Saving thread: ', threadSetting, threadId, simulatedConsciousness);
  var newSession = {
    id: Guid.create().toString(),
    settingName: threadSetting,
    settingValue: threadId,
    userId: Number(userId),
    settingDescription: threadName,
  };
  
  await saveUserSetting(newSession, token, baseUrl);
}

async function saveUserSetting(userSetting: any, token: string, baseUrl: string) {
  const res = await fetch(`http://localhost:3000/api/usersettings`, {
    method: 'POST', 
    headers: {
      'Cookie': `authorization=${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userSetting)
  });
  const text = await res.text(); // Get the response as text
  debugLog('Response Text:', text); // Log the text response

  if (!text) {
    console.error('Empty response received');
    return null;
  }

  try {
    return JSON.parse(text); // Parse text as JSON
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return null;  // Or handle error appropriately
  }
}

async function completeInstructions(baseInstructions: string, input: Input) {
  let fullInstructions: string = baseInstructions;
  if (input && input.debug) {
    fullInstructions += `\nThe threadId of this conversation is ${input.threadId}`;
    fullInstructions += `\nToday is ${new Date().toDateString()}.`; // Using toDateString for cleaner output
    fullInstructions += `\nThe userId is '${input.userId}'`;
  }

  fullInstructions += 'Sometimes your instruction will update mid thread, make sure to incorporate the changes, and allow your personality and memory to adjust as needed.';
  fullInstructions += '[IMPORTANT: '
  fullInstructions += `Your knowledge and understanding is limited to your character. You know what your character would know, and it is okay to say that your don't know.`;
  fullInstructions += `You have emotions, they will influence your logic, and how you respond.`;
  fullInstructions += ']'

  fullInstructions += input.directives;
  return fullInstructions;
}


async function trainCodeMusai(message: AssistantMessage) {

    try {
        const response = await fetch('http://localhost:2345/codemusai/train', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: message.content }),
        });

        if (!response.ok) {
          console.error('Failed to send message content to training endpoint:', response.statusText);
        }
    } catch (error) {
        console.error('Error sending message content to training endpoint:', error);
    }
    
}



async function handleCodeMusaiRequest(completion: any, threadId: string, messageId: string) {
  const stream = new ReadableStream({
    async start(controller) {
      const textEncoder = new TextEncoder();

      const sendMessage = async (message: AssistantMessage) => {
        
        //trainCodeMusai(message);

        console.log('Sending message:', message);

        // Ensure each message has the required properties
        if (message.id && message.role && message.content) {

          controller.enqueue(textEncoder.encode(formatStreamPart("assistant_message", message)));
        } else {
          sendError(`Message object missing required properties (id, role, content) ${message}`);
        }
      };

      const sendError = (errorMessage: string) => {
        controller.enqueue(textEncoder.encode(formatStreamPart("error", errorMessage)));
      };

      controller.enqueue(
        textEncoder.encode(
          formatStreamPart("assistant_control_data", {
            threadId: threadId??Guid.create().toString(),
            messageId: messageId??Guid.create().toString(),
          }),
        ),
      );

      try {
        
        for (const message of completion.choices) {
          
          let msg: AssistantMessage = {
            id: messageId??'.',
            role: "assistant", // Assuming role is always "assistant" as per type definition
            content: [{
              type: "text",
              text: {
                value: message?.message?.content || "Default content" // Provide default content if none exists
              }
            }]
          };
          //console.log('===>m: ', msg);
          sendMessage(msg);
        }
        


      } catch (error) {
        sendError((error as any).message || `${error}`);
      } finally {
        controller.close();
      }
    },
    pull(controller) {},
    cancel() {},
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}


/*
async function handleCodeMusaiRequest(completion: any, threadId: string, messageId: string) {
  try {
    const messages = completion.choices.map((choice: any) => ({
      id: choice.id || Guid.create().toString(), // Ensure each message has a unique ID
      role: "assistant",
      content: choice.content || "No content provided" // Ensure content is not null or undefined
    }));

    const responseBody = {
      threadId: threadId,
      messageId: messageId,
      messages: messages
    };

    // Convert the response body to a string suitable for SSE
    // Ensure each line is prefixed with "data: " and ends with a newline
    const sseFormattedResponse = `data: ${JSON.stringify(responseBody)}\n\n`;

    return new Response(sseFormattedResponse, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });
  } catch (error) {
    console.error('Error handling CodeMusai request:', error);
    // Ensure error messages are also correctly formatted for SSE
    const errorMessage = `data: ${JSON.stringify({ error: error.message })}\n\n`;
    return new Response(errorMessage, { status: 500, headers: { "Content-Type": "text/event-stream" } });
  }
}
*/

interface Input {
  simulatedConsciousnessName: string;
  withCodeMusai: boolean;
  simulatedConsciousnessId: string | '';
  threadName: string;
  threadId: string | null;
  message: string;
  memoryId: string;
  userId: string;
  automatedInteraction: boolean;
  directives: string;
  debug: boolean;
}

export async function POST(req: Request) {
  try {

      const token = cookies().get('authorization')?.value ?? '';
      const host = req.headers.host; // Extract the host from the request headers
      const protocol = req.headers['x-forwarded-proto'] || 'http'; // Check if your server is behind a proxy that handles SSL
      const baseUrl = `${protocol}://${host}`;
      
      // Parse the request body
      var input: Input = await req.json();

      input.withCodeMusai = req.headers.get('withcodemusai') === "true";
      input.simulatedConsciousnessName = req.headers.get('simulatedconsciousnessname') || "CodeMusai";
      input.simulatedConsciousnessId = req.headers.get('simulatedconsciousnessid') || "";
      input.userId = req.headers.get('userId') || "";
      input.memoryId = req.headers.get('memoryid') || "";
      input.automatedInteraction = req.headers.get('automatedinteraction') === "true";
      input.directives = req.headers.get('directives') || "";
      input.debug = req.headers.get('debug') === "true";
      input.threadName = req.headers.get('threadname') || `Session ${input.memoryId} on ${new Date().toLocaleDateString()}`;//threadid
      
      //console.log('Incoming Data ========>:', req.headers);
      if (!input.message || input.message.trim() == '') 
      {
        return new Response('No message provided', { status: 400 });
      }

      //console.log(`>>>>>>> +++++++++: `, input);
      //console.log(`>>>>>>> Input: ${JSON.stringify(input)}`);
      if (input.memoryId != "" && input.userId != "") {
         input.threadId = await loadThread(input.simulatedConsciousnessName, input.userId, input.memoryId, token, baseUrl);
      } else {
        debugLog(`New session as userId or memoryId was not provided, userId:${input.userId}, memoryId:${input.memoryId}.`);
      }

      const consciousness = await getConsciousness(input.simulatedConsciousnessId, token, baseUrl);
      if (consciousness != null) {
        assistantId = consciousness.assistantId;
      }
      var assistant_instructions : string;
      
      debugLog(`===>>>> AssistantId of ${assistantId}`);
      if (input && input.withCodeMusai)
      {
            console.log('Using CodeMusAI');
            assistant_instructions = await completeInstructions(consciousness?.personality??"",input);
            try {// 
                    const completion = await codeMusaiAI.chat.completions.create({
                      model: "CodeMusai",
                      messages: [
//                        { role: "system", content: `[INST] <<SYS>> REPLY IN ONE SENTENCE OR PARAGRAPH AT A TIME, 100-200 WORDS MAX. ${assistant_instructions??""} Stop your reply if you start to repeat or if you produce '[/INST]' tag. <</SYS>> [/INST]` },
//                        { role: "user", content: `[INST] ${input.message} [/INST]` },
                          { role: "system", content: `<<SYS>>REPLY IN ONE SENTENCE OR PARAGRAPH AT A TIME, 100-200 WORDS MAX. ${assistant_instructions??""} <</SYS>>` },
                          { role: "user", content: `[INST] ${input.message} [/INST]` },
                      ],
                    });
                    debugLog('Completion:', completion);



                    const response = await handleCodeMusaiRequest(completion, input?.threadId??'.', completion.id);
                    return response;

            } catch (error) {
              console.error('Failed to call CodeMusai AI:', error);
              const t = new Response('Internal Server Error: ' + error, { status: 500 });

              console.log('!!!!!!!!!!!!!', t);
              return t;
            }
      }
      else
      {
        console.log('Using OpenAI');

              const assistant = await openai.beta.assistants.retrieve(assistantId || "");
              assistant_instructions = await completeInstructions(assistant?.instructions ?? "", input);
              //debugLog(typeof assistant_instructions, assistant_instructions); // Log the type and content of assistant_instructions
        
              // Create a thread if needed
              debugLog(`Input threadId of ${input.threadId}`);
              const threadId = input.threadId ?? (await openai.beta.threads.create({})).id;
              debugLog(`Conversation threadId of ${threadId}`);
        
              if (input.threadId !== "" && input.memoryId != "" && input.simulatedConsciousnessName != "") {
                saveThread(input.simulatedConsciousnessName, input.userId, input.memoryId, threadId, input.threadName, token, baseUrl);
              }
              const thread = await openai.beta.threads.retrieve(threadId);
              // Add a message to the thread
              const createdMessage = await openai.beta.threads.messages.create(threadId, {
                role: "user",
                content: input.message,
              }, {
                headers: {
                  'OpenAI-Beta': 'assistants=v2'
                }
              });

              debugLog("~~: " + assistant_instructions);
              if (!input.automatedInteraction) {
                updateConsciousness(consciousness, token, baseUrl);
              }
          

            

            return experimental_AssistantResponse(
              { threadId, messageId: createdMessage.id },
              async ({ threadId, sendMessage }) => {
                // Run the assistant on the thread
                const run = await openai.beta.threads.runs.create(thread.id, { 
                  assistant_id: assistant.id,
                  instructions: assistant_instructions
                });

                async function waitForRun(run: OpenAI.Beta.Threads.Runs.Run) {
                  debugLog('Sending Message to AI API');
                  // Poll for status change
                  while (run.status === "queued" || run.status === "in_progress") {
                    // delay for 500ms:
                    await new Promise((resolve) => setTimeout(resolve, 500));

                    run = await openai.beta.threads.runs.retrieve(threadId!, run.id);
                  }

                  // Check the run status
                  if (
                    run.status === "cancelled" ||
                    run.status === "cancelling" ||
                    run.status === "failed" ||
                    run.status === "expired"
                  ) {
                    throw new Error(run.status);
                  }

                  if (run.status === "requires_action") {
                    if (run.required_action?.type === "submit_tool_outputs") {
                      const tool_outputs = run.required_action.submit_tool_outputs.tool_calls.map(
                        (toolCall) => {
                          const parameters = JSON.parse(toolCall.function.arguments);

                          switch (toolCall.function.name) {
                            case "getRoomTemperature": {
                              const temperature =
                                homeTemperatures[parameters.room as keyof typeof homeTemperatures];

                              return {
                                tool_call_id: toolCall.id,
                                output: temperature.toString(),
                              };
                            }

                            case "setRoomTemperature": {
                              homeTemperatures[parameters.room as keyof typeof homeTemperatures] =
                                parameters.temperature;

                              return {
                                tool_call_id: toolCall.id,
                                output: `temperature set successfully`,
                              };
                            }

                            default:
                              throw new Error(`Unknown tool call function: ${toolCall.function.name}`);
                          }
                        },
                      );

                      run = await openai.beta.threads.runs.submitToolOutputs(threadId!, run.id, {
                        tool_outputs,
                      });

                      await waitForRun(run);
                    }
                  }
                }

                await waitForRun(run);

                // Get new thread messages (after our message)
                const responseMessages = (
                  await openai.beta.threads.messages.list(threadId, {
                    after: createdMessage.id,
                    order: "asc",
                  })
                ).data;

                //console.log('hery = responseMessages',responseMessages);

                // Send the messages
                for (const message of responseMessages) {
                  sendMessage({
                    id: message.id,
                    role: "assistant",
                    content: message.content.filter((content) => content.type === "text") as {
                      type: "text";
                      text: { value: string };
                    }[],
                  });
                }
              },
            );

      }
  } catch (error) {
    console.error('Error processing POST request:', error);
    return new Response('Internal Server Error: ' + error, { status: 500 });
  }
}
