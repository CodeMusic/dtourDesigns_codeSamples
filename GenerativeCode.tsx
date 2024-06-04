"use client";
import { useState } from "react";
import {
  CopilotTask,
  
  useCopilotContext,
  useMakeCopilotReadable,
} from "@copilotkit/react-core";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "_components/ui/dialog";
import Header from "_components/secure/prototypes/GenerativeCode/header";
import Sidebar from "_components/secure/prototypes/GenerativeCode/sidebar";
import PreviewScreen from "_components/secure/prototypes/GenerativeCode/preview-screen";
import { Input } from "_components/ui/input";
import { text } from "stream/consumers";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { Speak, Hush } from "_components/common/CodeMusai/TemporalLobe/AuditoryCortex"
import { useAlertService, useUserService, useGenerativeResultService, IGenerativeResult } from '../../../../_services'; 
import { truncateString } from "../../../../_helpers/common/formatHelpers";

import { useCopilotAware } from "_components/common/CommonComponents";

export { GenerativeCode }
function GenerativeCode() {
  const [code, setCode] = useState<string[]>([
    `<h1 class="tw-text-red-500">Hello World</h1>`,
  ]);
  const [codeToDisplay, setCodeToDisplay] = useState<string>(code[0] || "");
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [codeCommand, setCodeCommand] = useState<string>("");

  useCopilotAware(codeToDisplay);
  useCopilotAware(codeCommand);

  const alertService = useAlertService();
  const userService = useUserService();
  const generativeResultService = useGenerativeResultService();
  const curUser = userService.currentUser;

  const readableCode = useMakeCopilotReadable(codeToDisplay);

  const [isGenerating, setIsGenerating] = useState(false); 

  const max_tokens = 4000;

  function getSystemMessage()
  {
    return truncateString(`Create Code Snippet with React.js, tailwindcss, and use tw- as the className prefix.`, max_tokens);      
  }

  const additionalInstructions = ". Make the code easy to read by using </br> line returns after semicolons, if statements, and other logical operators. Do not just return the code, make it easy to read. Style the returning source code so it is easy to read.";

  const generateCode = new CopilotTask({
    instructions: codeCommand + additionalInstructions,
    includeCopilotReadable: true,
    actions: [
      {
        name: "generateCode",
        description: getSystemMessage(),

        parameters: [
          {
            name: "code",
            type: "string",
            description: "Code to be generated",
            required: true,
          },
        ],
        handler: async ({ code }) => {
          setCode((prev) => [...prev, code]);
          setCodeToDisplay(code);
          saveCode(code);
          setIsGenerating(false);
          console.log("Code: " + code);
          Hush();
          Speak("Code generated successfully for the request: " + codeCommand);
        },
      },
    ],
  })

  const saveCode = async (code: string) => { 

    var generativeIdea : IGenerativeResult = {
      title: codeCommand,
      type: "Code",
      system_message: getSystemMessage(),
      prompt: codeCommand,
      
      result: code,
      authorUserId: Number(curUser?.id ?? 1)
    };

    await generativeResultService.create(generativeIdea);
    alertService.success('Code saved', true);
  }   

  const context = useCopilotContext();
  
  return (
    <>
      <main className="tw-bg-white tw-min-h-screen tw-px-4">
        
        <div className=" tw-mx-auto p-1 tw-rounded-full tw-bg-primary tw-flex tw-my-4 tw-outline-0">
          <Input
            type="text"
            placeholder="Enter your code command"
            className="tw-w-10/12 tw-h-[4em] tw-p-4 tw-rounded-l-full tw-text-xl  tw-outline-0 tw-bg-primary tw-text-white"
            value={codeCommand}
            onChange={(e) => setCodeCommand(e.target.value)}
          />
          { !isGenerating && 
                <button
                  className="tw-w-2/12 tw-bg-white tw-text-primary tw-rounded-r-full"
                  onClick={() => {
                    Speak("Generating code...");
                    setIsGenerating(true); 
                    generateCode.run(context)
                  }}
                >
                  <div className='tw-flex tw-items-center'><SparklesIcon className="tw-ml-4 tw-mr-1 tw-h-9 tw-w-9" /> <div className="tw-text-xl tw-font-bold">Generate</div></div>
                </button>
          }
          { isGenerating && 
            <button
              className="tw-w-2/12 tw-bg-white tw-text-primary tw-rounded-r-full tw-cursor-wait tw-text-center tw-p-2"
            >
              <div className='tw-flex tw-items-center'><div className="tw-text-xl tw-font-bold">Generating...</div><SparklesIcon className="tw-ml-4 tw-mr-1 tw-h-9 tw-w-9" /> </div>
            </button>
          }

          
        </div>
        <Header openCode={() => setShowDialog(true)} />
        <div className="tw-w-full tw-h-full tw-min-h-[70vh] tw-flex tw-justify-between tw-gap-x-1 ">
          
          <Sidebar>
          
            <div className="tw-space-y-2">
            
              {code.map((c, i) => (
                <div
                  key={i}
                  className="tw-w-full tw-h-20 tw-p-1 tw-rounded-md tw-bg-white tw-border tw-border-blue-600"
                  onClick={() => setCodeToDisplay(c)}
                >
                  v{i}   ({c.substring(0, 40)}...)
                </div>
              ))}
            </div>
          </Sidebar>

          <div className="tw-w-10/12">
            <PreviewScreen html_code={codeToDisplay || ""} />
          </div>
        </div>
        
      </main>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>View Code.</DialogTitle>
            <DialogDescription>
              You can use the following code to start integrating into your
              application.
            </DialogDescription>
            <div className="tw-p-4 tw-rounded tw-bg-primary tw-text-white tw-my-2">
              {codeToDisplay}
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}