import React, { useState } from 'react'; 
import { useCopilotAware, ActionButton } from "_components/common/CommonComponents";
import { useCopilotAction, CopilotTask, useCopilotContext } from "@copilotkit/react-core";
import { useAlertService, useUserService, useGenerativeResultService, IGenerativeResult } from '_services'; 
import { useMakeCopilotReadable } from "@copilotkit/react-core";
import { Spinner } from "_components/common/Spinner";
import { SparklesIcon, BanknotesIcon, UserPlusIcon, ClipboardDocumentCheckIcon, ChatBubbleLeftIcon, PaintBrushIcon, RocketLaunchIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Hush, Speak } from "_components/common/CodeMusai/TemporalLobe/AuditoryCortex"

export const IdeaAssistantTask: React.FC = () => 
{ 
  const [textareaValue, setTextareaValue] = useState('');
  //const processedValue = useMakeCopilotReadable(textareaValue??"");
  const alertService = useAlertService();
  const userService = useUserService();
  const generativeResultService = useGenerativeResultService();
  const curUser = userService.currentUser;
  
  function setContext(e: any) {
    let value = e?.target?.value ?? "";
    console.log(value);
    setTextareaValue(value); // Update state instead of calling the hook directly
  }

  function getSystemMessage()
  {
    return "You are a visionary who turns inspiration into fully developed ideas. Given the idea '" + inspiration + "', you will generate a the idea content, features, specifications, supporting research, how to monitization the product, and sample code to faciiltate building it.";
  }

    const [inspiration, setInspiration] = useState<string>(''); 
    const [ideaContent, setIdeaContent] = useState<IdeaModel>(); 
    // Simulate the CopilotAction research function 
    useCopilotAware("Inspiration: " + inspiration);
    useCopilotAware("Idea Content: " + ideaContent);
    
    const context = useCopilotContext();
    const runIdeaGenerationTask = new CopilotTask({
        instructions:
          getSystemMessage(),
          includeCopilotReadable: true
        });
      const [runIdeaGenerationTaskRunning, setRunIdeaGenerationTaskRunning] = useState(false);


    const readFormedIdea = async (producedIdea: IdeaModel) => { 

        if (!producedIdea) 
        {
            return; 
        }
        var reportContent = "<p>";
        reportContent += " Ok, here is what I have come up with for your inspiration, " + producedIdea.inspiration;
        reportContent += " presenting " + producedIdea.appName;
        reportContent += " , " + producedIdea.salesPitch;
        reportContent += " Idea Content, " + producedIdea.ideaContent;
        reportContent += " Features, " + producedIdea.features;
        reportContent += " Specifications, " + producedIdea.specifications;
        reportContent += " Supporting Research, " + producedIdea.supportingResearch;
        reportContent += " Monitization, " + producedIdea.monitization;
        reportContent += " Sample Code, " + producedIdea.sampleCode;
        reportContent += " Database Schema, " + producedIdea.databaseSchema;
        reportContent += "</p>";
        var div = document.createElement("div");
        div.innerHTML = reportContent;
        var readableReport = div.textContent || div.innerText || "";

        //useMakeCopilotReadable(readableReport);
        Speak(readableReport);
        setContext(readableReport);
        return;
    }; 

    const getHTMLMarkdown = async (ideaContent: IdeaModel) =>
    {
      var researchContent = "<div className='tw-border tw-border-black tw-text-black tw-text-lg tw-bg-gray-100 tw-shadow tw-mt-2 tw-rounded tw-p-2'>";
      researchContent += `<strong className='tw-text-2xl tw-pl-4'>${ideaContent.appName}</strong> `;
      researchContent += "<br/>";
      researchContent += `<div className='tw-text-sm tw-font-italic tw-pl-4'>Original Inspiration: ${ideaContent.inspiration}</div>`;
      researchContent += "<br/>";
      researchContent += `<em className='tw-text-base tw-italic tw-pl-4'>Marketing: <br/>${ideaContent.salesPitch}</em>`;
      researchContent += "<br/>";
      researchContent += `<div className='tw-text-base tw-mt-2 tw-mb-2 tw-pl-4'>${ideaContent.ideaContent}</div>`;
      researchContent += "<br/>";      
      researchContent += `<div className='tw-text-base tw-mt-2 tw-mb-2 tw-pl-4'>${ideaContent.features}</div>`;
      researchContent += "<br/>";
      researchContent += `<div className='tw-text-base tw-mt-2 tw-mb-2 tw-pl-4'>${ideaContent.specifications}</div>`;
      researchContent += "<br/>";
      researchContent += `<div className='tw-text-base tw-mt-2 tw-mb-2 tw-pl-4'>${ideaContent.monitization}</div>`;
      researchContent += "<br/>";
      researchContent += `<div className='tw-text-base tw-mt-2 tw-mb-2 tw-pl-4'>${ideaContent.sampleCode}</div>`;
      researchContent += "<br/>";
      researchContent += `<div className='tw-text-base tw-mt-2 tw-mb-2 tw-pl-4'>${ideaContent.databaseSchema}</div>`;
      researchContent += "<br/>";
      researchContent += "</div>";

      return researchContent;
    }

    const saveIdea = async (idea: IdeaModel) => { 

      var generativeIdea : IGenerativeResult = {
        title: idea.appName,
        type: "Idea",
        system_message: getSystemMessage(),
        prompt: "Idea: " + idea.appName,
        
        result: await getHTMLMarkdown(idea),
        authorUserId: Number(curUser?.id ?? 1)
      };

      await generativeResultService.create(generativeIdea);
      alertService.success('Idea saved', true);
    }   


useCopilotAction({
    name: "populateIdeaContent",
    description:
      "Populate the ideaContent state variable with the result of the research.",
    parameters: [
      {
        name: "inspiration",
        type: "string",
        description: "The inspiration provided by the user, in your own words.",
      },
      {
        name: "appName",
        type: "string",
        description: "A catchy name for the app, ideally the name will use aliteration, and be a couple words long.",
      },
      {
        name: "salesPitch",
        type: "string",
        description: "A compelling sales pitch advertisment for the app, it should be a few sentences long, and make the user want to buy the app.",
      },
      {
        name: "ideaContent",
        type: "string",
        description: "The main content of the idea, this section will be very descriptive and detailed. It will use HTML markdown, be uniquely styled, and tailwind CSS with with tw- as the className prefix. It will be 6 to 12 paragraphs long, and the paragraphs should be seperated with <br/> tags, it may include bullet points. It should be interesting, engaging, and factual.",
      },      
      {
        name: "features",
        type: "string",
        description:
          "A list of features with headers and details in bullet point form that the app will have, each feature should have a few bullet points. It will use HTML markdown, be uniquely styled, and tailwind CSS with with tw- as the className prefix.",
      },
      {
        name: "specifications",
        type: "string",
        description:
          "The specifications of the app, detailing how to build it, and what should be included. I developer should be able to use these specifications to produce the idea. This section will use HTML markdown, be uniquely styled, and tailwind CSS with with tw- as the className prefix.",
      },
      {
        name: "supportingResearch",
        type: "string",
        description:
          "This includes user research, supporting why this idea is a good idea, and how it will solve the user's problem. This area will also include the user's pain points, and how the idea will address those pain points. This area will also include a section for general research, supporting research, and a list of all relevant resources, urls, and references. This area will use HTML markdown, be uniquely styled, with <br/> tags to seperate paragraphs and section, and it will use tailwind CSS with with tw- as the className prefix.",
      },
      {
        name: "monitization",
        type: "string",
        description:
          "Monitization of the app, how we can make money from this idea. It will be clear and concise. It will also provide realistic estimates of how much it will cost to monitize the app, how much it will cost to maintain the app, and how much money the app is expected to make. This area will use HTML markdown, be uniquely styled, with <br/> tags to seperate paragraphs and section, and it will use tailwind CSS with with tw- as the className prefix.",
      },            
      {
        name: "sampleCode",
        type: "string",
        description:
          "Produce as much code to facilitate building the app. It will written in React, NextJs and TypeScript with mySQL. If possible show code for multiple files with the name of the file as the header. This area will use HTML markdown, be uniquely styled, with <br/> tags to seperate paragraphs and section, and it will use tailwind CSS with with tw- as the className prefix.",
      },     
      {
        name: "databaseSchema",
        type: "string",
        description:
          "The database schema of the app, it will be a list of tables, and the columns in each table, and the relationships between the tables. This area will use HTML markdown, be uniquely styled, with <br/> tags to seperate paragraphs and section, and it will use tailwind CSS with with tw- as the className prefix.",
      },
    ],
    handler: async ({ inspiration, appName, salesPitch, ideaContent, features, specifications, supportingResearch, monitization, sampleCode, databaseSchema }) => {
      const newIdea: IdeaModel = {
        inspiration,
        appName,
        salesPitch,
        ideaContent,
        features,
        specifications,
        supportingResearch,
        monitization,
        sampleCode,
        databaseSchema
      };
      readFormedIdea(newIdea);
      await setIdeaContent(newIdea);
      saveIdea(newIdea);
      //CopilotAware(newIdea);
    },
    render: "Running AI Automated Research...",
  });



    return (
                <>
                    <div>
                    {
                        ideaContent && 
                        <div className='tw-border tw-border-black tw-text-black tw-text-lg tw-bg-gray-100 tw-shadow tw-mt-2 tw-rounded tw-p-2'>
                            <strong className='tw-text-2xl tw-pl-4'>{ideaContent.appName}</strong> 
                            <br/><RocketLaunchIcon className="tw-font-bold tw-pl-1 tw-h-6 tw-w-6"/>
                            <div className='tw-text-sm tw-font-italic tw-pl-4' dangerouslySetInnerHTML={{__html: "Original Inspiration: " + ideaContent.inspiration}} />
                            <br/><ChatBubbleLeftIcon className="tw-font-bold tw-pl-1 tw-h-6 tw-w-6"/>
                            <em className='tw-text-base tw-italic tw-pl-4' dangerouslySetInnerHTML={{__html: "Marketing: " + ideaContent.salesPitch}} /> 
                            <br/><MagnifyingGlassIcon className="tw-font-bold tw-pl-1 tw-h-6 tw-w-6"/>
                            <div className='tw-text-base tw-mt-2 tw-mb-2 tw-pl-4' dangerouslySetInnerHTML={{__html: ideaContent.ideaContent}}/>
                            <br/><PaintBrushIcon className="tw-font-bold tw-pl-1 tw-h-6 tw-w-6"/>
                            <div className='tw-text-base tw-mt-2 tw-mb-2 tw-pl-4' dangerouslySetInnerHTML={{__html: ideaContent.features}} />
                            <br/><ClipboardDocumentCheckIcon className="tw-font-bold tw-pl-1 tw-h-6 tw-w-6"/>
                            <div className='tw-text-base tw-mt-2 tw-mb-2 tw-pl-4' dangerouslySetInnerHTML={{__html: ideaContent.specifications}} />
                            <br/><UserPlusIcon className="tw-font-bold tw-pl-1 tw-h-6 tw-w-6"/>
                            <div className='tw-text-base tw-mt-2 tw-mb-2 tw-pl-4' dangerouslySetInnerHTML={{__html: ideaContent.supportingResearch}} />
                            <br/><BanknotesIcon className="tw-font-bold tw-pl-1 tw-h-6 tw-w-6" />
                            <div className='tw-text-base tw-mt-2 tw-mb-2 tw-pl-4' dangerouslySetInnerHTML={{__html: ideaContent.monitization}} />
                            <br/><br/><SparklesIcon className="tw-font-bold tw-pl-1 tw-h-6 tw-w-6" /><br/>
                            <div className='tw-text-base tw-mt-2 tw-mb-2 tw-pl-4' dangerouslySetInnerHTML={{__html: ideaContent.sampleCode}} />
                            <br/>
                            <div className='tw-text-base tw-mt-2 tw-mb-2 tw-pl-4' dangerouslySetInnerHTML={{__html: ideaContent.databaseSchema}} /> 
                            <br/><SparklesIcon className="tw-font-bold tw-pl-1 tw-h-6 tw-w-6" />
                        </div>
                    /**
                             inspiration,
                            appName,
                            salesPitch,
                            ideaContent,
                            features,
                            specifications,
                            supportingResearch,
                            monitization,
                            sampleCode,
                            databaseSchema
                     */
                    
                    } 
                    </div>
                    <div> 
                    <input className='tw-border tw-border-black tw-text-white tw-text-lg tw-bg-gray-700 tw-shadow tw-mt-2 tw-rounded' type="text" 
                            value={inspiration} 
                            onChange={(e) => setInspiration(e?.target?.value ?? "")} 
                            onKeyDown={async (e) => {
                                if (e.key === "Enter") {
                                    setRunIdeaGenerationTaskRunning(true);
                                    Speak("Starting Idea Generation from the inspiration " + inspiration);
                                    await runIdeaGenerationTask.run(context);
                                    setRunIdeaGenerationTaskRunning(false);
                                }
                            }}
                            placeholder="Enter Inspiration for App Idea" /> 
                    <ActionButton 
                    className='rounded-l-none ml-[1px] btn btn-primary tw-border hover:tw-bg-gray-800 tw-border-black tw-text-white tw-bg-black tw-shadow tw-mt-2' 
                    disabled={runIdeaGenerationTaskRunning}
                    onClick={async () => {
                        setRunIdeaGenerationTaskRunning(true);
                        Speak("Starting Idea Generation from the inspiration " + inspiration);
                        await runIdeaGenerationTask.run(context);
                        setRunIdeaGenerationTaskRunning(false);
                    }}
                    >

                        <div className='tw-flex tw-items-center'>Design Idea 
                            { runIdeaGenerationTaskRunning == true  //className="tw-font-bold tw-pl-w tw-h-6 tw-w-6"
                                ? <Spinner />
                                : <SparklesIcon className="tw-font-bold tw-pl-w tw-h-6 tw-w-6" />   
                            }
                            
                        </div>
                    </ActionButton> 

         
                    </div> 
                </>
            ); 
}; 

export interface IdeaModel {
    inspiration: string;
    appName: string;
    salesPitch: string;
    ideaContent: string;
    features: string;
    specifications: string;
    supportingResearch: string;
    monitization: string;
    sampleCode: string;
    databaseSchema: string;
}
