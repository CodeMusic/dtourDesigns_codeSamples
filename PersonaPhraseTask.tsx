import React, { useState, useEffect } from 'react'; 
import { useCopilotAware, ActionButton, AutoGrowTextArea } from "../../../../_components/common/CommonComponents";
import { useCopilotAction, CopilotTask, useCopilotContext } from "@copilotkit/react-core";
import { useAlertService, useUserService, useGenerativeResultService, IGenerativeResult } from '../../../../_services'; 
import { useMakeCopilotReadable } from "@copilotkit/react-core";
import { formatMarkdown } from "../../../../_helpers/common/formatHelpers";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { Hush, Speak, SpeakActor } from "../../../../_components/common/CodeMusai/TemporalLobe/AuditoryCortex"
import { truncateString } from '../../../../_helpers/common/formatHelpers'
import { Spinner } from "../../../../_components/common/Spinner";

const max_tokens = 4000;

const PersonaPhraseTask: React.FC = () => 
{ 

  const alertService = useAlertService();
  const userService = useUserService();
  const generativeResultService = useGenerativeResultService();
  const curUser = userService.currentUser;
  const [htmlContent, setHtmlContent] = useState('');


  function getSystemMessage()
  {
    return truncateString(`You are a communication assistant. The user's 'personality type is ${senderPersonalityType}, the target person's personality type is ${receiverPersonalityType}, and the message they want to send is ${senderMessage}. Your task is to rewrite the message in a way that best suits the target person's personality type.`, max_tokens);      
  }

    const [senderMessage, setSenderMessage] = useState<string>(''); 
    const [senderPersonalityType, setSenderPersonalityType] = useState<string>(''); 
    const [receiverPersonalityType, setReceiverPersonalityType] = useState<string>(''); 
    
    const [personaPhraseContent, setPersonaPhraseContent] = useState<PersonaPhraseModel>(); 
    useCopilotAware("senderMessage: " + senderMessage);
    useCopilotAware("senderPersonalityType: " + senderPersonalityType);
    useCopilotAware("receiverPersonalityType: " + receiverPersonalityType);
    
    
    const context = useCopilotContext();
    const runPersonaPhraseTask = new CopilotTask({
        instructions:
          getSystemMessage(),
          includeCopilotReadable: true
        });
      const [runPersonaPhraseTaskRunning, setRunPersonaPhraseTaskRunning] = useState(false);


    const readPersonaPhrase = async (aPersonaPhrase: PersonaPhraseModel) => { 

        if (!aPersonaPhrase) 
        {
            return; 
        }
        var personaPhraseRead = "<p>";
        personaPhraseRead += `The adjusted message from ${formatMarkdown(aPersonaPhrase?.senderPersonalityType)} to ${formatMarkdown(aPersonaPhrase?.receiverPersonalityType)} is the following: `;
        personaPhraseRead += `${formatMarkdown(aPersonaPhrase?.receiverMessage)}`;
        personaPhraseRead += "</p>";
        var div = document.createElement("div");
        div.innerHTML = personaPhraseRead;
        var readableMaterial = div.textContent || div.innerText || "";

        Speak(readableMaterial);
        return;
    }; 


    useEffect(() => {
      const fetchHtmlContent = async () => {
        if (personaPhraseContent) {
          const content = await getHTMLMarkdown(personaPhraseContent);
          setHtmlContent(content);
        }
      };
    
      fetchHtmlContent();
    }, [personaPhraseContent]); // Re-run when comedy changes


    const getHTMLMarkdown = async (aPersonaPhrase: PersonaPhraseModel) =>
    {
      console.log('Building Markdown from personaPhrase.');
      var personaPhraseMarkdown = `<div className='tw-border tw-border-black tw-text-black tw-text-lg tw-bg-gray-100 tw-shadow tw-mt-2 tw-rounded tw-p-2'>`;
      personaPhraseMarkdown += `<strong className='tw-text-2xl tw-pl-4'>${aPersonaPhrase.senderPersonalityType}</strong><hr/>`;
      personaPhraseMarkdown += `<div className='tw-text-sm tw-font-italic tw-pl-4'>${aPersonaPhrase.senderMessage}</div><hr/><br/>`;//`<br/>`;
      personaPhraseMarkdown += `<hr/><br/>`;
      personaPhraseMarkdown += `<strong className='tw-pl-4'>${aPersonaPhrase.receiverPersonalityType}</strong><hr/>`;
      personaPhraseMarkdown += `<div className='tw-pl-4'>${aPersonaPhrase.receiverMessage}</div><br/>`;
      personaPhraseMarkdown += `</div>`;

      return formatMarkdown(personaPhraseMarkdown);
    }

    const savePersonaPhrase = async (aPersonaPhrase: PersonaPhraseModel) => { 
      try
      {
        var personaPhraseData : IGenerativeResult = {
          type: "PersonaPhrase",
          system_message: getSystemMessage(),
          prompt: "Input: " + senderMessage,
          title: senderPersonalityType + " to " + receiverPersonalityType,
          result: await getHTMLMarkdown(aPersonaPhrase),
          authorUserId: Number(curUser?.id ?? 1)
        };

        await generativeResultService.create(personaPhraseData);
        alertService.success('PersonaPhrase saved', true);
      }
      catch (error)
      {
        alertService.error('Error saving personaPhrase: ' + error, true);
      }
    }   

    const formatHTML : string = "Use bolded and underlined headers for each of the sections, accomplish the style by using tailwind CSS 'tw-font-bold', 'tw-font-underline', and 'tw-text-xl'. Only clickable links should be colored blue. Use style and color in your CSS to make your content engaging. The content should be clever, funny, and entertaining. It will use HTML markdown, and be uniquely styled however you want. The CSS needs to use tailwind CSS with 'tw-' as the className prefix. The line breaks will be represented with <br/> tags.";

useCopilotAction({
    name: "populatePersonaPhraseContent",
    description:
     `Populate the personaPhraseContent state variable with a personaPhrase that best suits the receiver's personality type.`,
   
  parameters: [
      {
        name: "senderPersonalityType",
        type: "string",
            description: "The personality type of the sender as provided by the user." + formatHTML,
      },
      {
        name: "senderMessage",
        type: "string",
            description: "The message that the sender wants to send to the receiver." + formatHTML,
      },
      {
        name: "receiverPersonalityType",
        type: "string",
          description: "The personality type of the receiver as provided by the user." + formatHTML,
      }, 
      {
        name: "receiverMessage",
        type: "string",
          description: `From knowing that the sender wrote '${senderMessage}' and that their personality type is ${senderPersonalityType} and that the receivers personality type is ${receiverPersonalityType}, create a message that would be a good fit for the receiver.` + formatHTML,
      }, 

    ],
    handler: async ({ senderPersonalityType, senderMessage, receiverPersonalityType, receiverMessage }) => {
      const personaPhrase: PersonaPhraseModel = {
        senderPersonalityType: senderPersonalityType,
        senderMessage: senderMessage,
        receiverPersonalityType: receiverPersonalityType,
        receiverMessage: receiverMessage,
      };
      console.log('PersonaPhrase prepared.');
      readPersonaPhrase(personaPhrase);
      setPersonaPhraseContent(personaPhrase);
      savePersonaPhrase(personaPhrase);
    },
    render: "Running MakeItFunny Task...",
  });


    return (
                <>
                    <div>
                    { //<div className='' dangerouslySetInnerHTML={{__html: htmlContent}}/>
                        personaPhraseContent && 
                        <>
                          <div className='tw-border tw-border-black tw-text-black tw-text-lg tw-bg-gray-100 tw-shadow tw-mt-2 tw-rounded tw-p-2'>
                            <div className='' dangerouslySetInnerHTML={{__html: htmlContent}}/>
                          </div>
                        </>
                    } 
                    </div>
                    <div> 
                    <AutoGrowTextArea className='tw-w-full tw-h-[250px] tw-p-2 tw-border tw-border-black tw-text-white tw-text-lg tw-bg-gray-700 tw-shadow tw-mt-2 tw-rounded'
                            value={senderPersonalityType} 
                            maxRows={5}
                            onChange={(e) => setSenderPersonalityType(e?.target?.value ?? "")} 
                            placeholder="Enter your personality type here... (eg ENTF-C)" /> <br/>
                    <AutoGrowTextArea className='tw-w-full tw-h-[250px] tw-p-2 tw-border tw-border-black tw-text-white tw-text-lg tw-bg-gray-700 tw-shadow tw-mt-2 tw-rounded'
                            value={senderMessage} 
                            maxRows={5}
                            onChange={(e) => setSenderMessage(e?.target?.value ?? "")} 
                            placeholder="Enter your message here..." /> <br/>
                    <AutoGrowTextArea className='tw-w-full tw-h-[250px] tw-p-2 tw-border tw-border-black tw-text-white tw-text-lg tw-bg-gray-700 tw-shadow tw-mt-2 tw-rounded'
                    value={receiverPersonalityType} 
                    maxRows={5}
                    onChange={(e) => setReceiverPersonalityType(e?.target?.value ?? "")} 
                    placeholder="Enter the receivers personality type here... (eg INFJ-A)" /> <br/>
                    <ActionButton 
                    className='rounded-l-none ml-[1px] btn btn-primary tw-border hover:tw-bg-gray-800 tw-border-black tw-text-white tw-bg-black tw-shadow tw-mt-2' 
                    disabled={runPersonaPhraseTaskRunning}
                    onClick={async () => {
                        console.log(`Personalizing message for ${senderPersonalityType} to ${receiverPersonalityType}...`);
                        setRunPersonaPhraseTaskRunning(true);
                        Speak("One moment communicate it...");
                        await runPersonaPhraseTask.run(context);
                        setRunPersonaPhraseTaskRunning(false);
                    }}
                    >
                        <div className='tw-flex tw-items-center'>Persona-lize it!
                            { runPersonaPhraseTaskRunning == true  //className="tw-font-bold tw-pl-w tw-h-6 tw-w-6"
                                ? <Spinner />
                                : <SparklesIcon className="tw-font-bold tw-pl-w tw-h-6 tw-w-6" />   
                            }
                        
                        </div>
                    </ActionButton> 

         
                    </div> 
                </>
            ); 
}; 

export default PersonaPhraseTask;

export interface PersonaPhraseModel {
    senderPersonalityType: string;
    senderMessage: string;
    receiverPersonalityType: string;
    receiverMessage: string;
  }
