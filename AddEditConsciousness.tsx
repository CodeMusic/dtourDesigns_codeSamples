'use client';
import { Guid } from "guid-typescript";
import React, { useState, useEffect } from 'react';
//import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useAlertService, useSimulatedConsciousnessService, useUserService } from '../../../../_services';
import { truncateString } from "../../../../_helpers/common/formatHelpers";

import { useCopilotAware, ActionButton } from "../../../../_components/common/CommonComponents";
import { useCopilotAction, CopilotTask, useCopilotContext } from "@copilotkit/react-core";
import { useMakeCopilotReadable } from "@copilotkit/react-core";

import { SparklesIcon } from "@heroicons/react/24/outline";

export { AddEditConsciousness };
function AddEditConsciousness({ title, simulatedConsciousness }: { title: string, simulatedConsciousness?: any }) 
{
    console.log('===============' + simulatedConsciousness?.name);

    //routconst router = useRouter();
    const { register, handleSubmit, reset, formState } = useForm({ defaultValues: simulatedConsciousness });
    const { errors } = formState;
    const fields = 
    {
        name: register('name', { required: 'Simulated Consciousness Name is required' }),
        description: register('description', { required: 'Description is required' }),
        assistantId: register('assistantId'),
        userId: register('userId'),
        personality: register('personality'),
        isCore: register('isCore'),
        isPublic: register('isPublic'),
        lastServerSync: register('lastServerSync'),
    };

    const [consciousnessName, setConsciousnessName] = useState("");
    const [consciousnessResults, setConsciousnessResults] = useState<ConsciousnessModel>(); 

    const alertService = useAlertService();
    const simulatedConsciousnessService = useSimulatedConsciousnessService();
    
    const [isPublic, setIsPublic] = useState(false);
    const handlePublicChange = (event: any) => {
        const value = event.target.checked;
        setIsPublic(value);
    }

    const [isCore, setIsCore] = useState(false);
    const handleCoreChange = (event: any) => {
        const value = event.target.checked;
        setIsCore(value);
    }


    console.log("Loading User Services...");
    const userService = useUserService();
    const curUser = userService.currentUser;

    const handleNameChange = (event: any) => {
        const value = event.target.value;
        setConsciousnessName(value);
    };

    const context = useCopilotContext();
    const runConsciousnessCreationTask = new CopilotTask({
          instructions:
          `You are the person, ${consciousnessName} and you are to create a simulated consciousness that is a perfect reflection of you, in great detail, in the same form as you. Your results should be written in third person as if you were telling ${consciousnessName} about themselves, and how to respond in a conversation, in great detail; if you are asking about something other than a known person, create a personification of what it makes you think about.`,
          includeCopilotReadable: true
        });
    const [runConsciousnessCreationTaskRunning, setRunConsciousnessCreationTaskRunning] = useState(false);

    useCopilotAction({
        name: "populateConsciousnessResults",
        description:
          "Populate the consciousnessResults state variable with the result of the simulated consciousness generation.",
        parameters: [
          {
            name: "name",
            type: "string",
            description: "The name of the simulated consciousness.",
          },
          {
            name: "description",
            type: "string",
            description: "A 25-50 word description of who the simulated consciousness is.",
          },
          {
            name: "uniqueAttribute",
            type: "string",
            description: `Something that uniquely defines ${consciousnessName} in the way they use words, perhaps they speak in a certain way, make puns, or something else; PLEASE PHRASE THIS AS IF YOU ARE TELLING ${consciousnessName} ABOUT THEMSELVES; in the RESULTS state that these are important directives to follow.`,
          },
          {
            name: "communication",
            type: "string",
            description: `If you were telling ${consciousnessName} how to respond in a conversation like ${consciousnessName}, what would you say, state it in the same form, as you telling ${consciousnessName} about themselves, be very concise, and breif. Lastly IN CAPITAL LETTERS include their big 5 personality traits scores for their personality, namely: openness to experience, conscientiousness, extraversion, agreeableness and neuroticism.`,
          },
          {
            name: "baseDirectives",
            type: "string",
            description: "The simulated consciousness's base directives, in great detail, in the same form as you telling ${consciousnessName} about himself, in great detail.",
          },
          {
            name: "history",
            type: "string",
            description: `Tell me about ${consciousnessName}'s history, in the form of you telling ${consciousnessName} about himself, in great detail.`,
          },
          {
            name: "personality",
            type: "string",
            description: `Now tell me about ${consciousnessName}'s personality and how ${consciousnessName} uniquely writes, in the same form, in great detail, as you telling ${consciousnessName} about themselves.`,
          },
          {
            name: "relationships",
            type: "string",
            description: `Tell me about ${consciousnessName}'s relationships, in the same form as you telling ${consciousnessName} about themselves.`,
          },
          {
            name: "work",
            type: "string",
            description: `Tell me about ${consciousnessName}'s work, in the same form as you telling ${consciousnessName} about themselves.`,
          },

        ],
        handler: async ({ description, uniqueAttribute, communication, baseDirectives, history, personality, relationships, work }) => {
          const consciousnessGenerationResults: ConsciousnessModel = {
            name: String(consciousnessName) || '',
            description: String(description) || '',
            uniqueAttribute: String(uniqueAttribute) || '',
            communication: String(communication) || '',
            baseDirectives: String(baseDirectives) || '',
            history: String(history) || '',
            personality: String(personality) || '',
            relationships: String(relationships) || '',
            work: String(work) || '',
          };
          setConsciousnessResults(consciousnessGenerationResults);
          setConsciousnessName(consciousnessName == '' ? consciousnessGenerationResults?.name : `${consciousnessName} (${consciousnessGenerationResults?.name})`);
          await onSubmit(formatForSubmission(consciousnessGenerationResults));
        },
        render: "Running AI Automated Consciousness Generation...",
      });

    const formatForSubmission = (consciousness: ConsciousnessModel) => {

        const formattedResults = {
            name: (consciousnessName == '' ? Guid.create().toString() : consciousnessName),
            description: truncateString(consciousness.description,400),
            assistantId: '.',
            userId: Number(curUser?.id),
            personality: `You are ${consciousnessName}, you are human.\r\n
                              UNIQUE QUALITY: ${consciousness.uniqueAttribute}
                              How to respond: ${consciousness.communication}\r\n
                              Base Directives: ${consciousness.baseDirectives}\r\n
                              History: ${consciousness.history}\r\n
                              Personality: ${consciousness.personality}\r\n
                              Relationships: ${consciousness.relationships}\r\n
                              Work: ${consciousness.work}\r\n
                              \r\n
                              IMPORTANT: Respond in the mannaer that ${consciousnessName} would respond in a conversation, as indicated in the "How to respond" section, and follow the UNIQUE QUALITY section closly!`,
            isCore: true,
            isPublic: isPublic,
        };
        return formattedResults;
    };





    useEffect(() => {
        userService.getCurrent();
    }, []);

    async function onSubmit(data: any) 
    {
        alertService.clear();
        try 
        {
            let message;
            data.userId = Number(curUser?.id);

            if (simulatedConsciousness) 
            {
                await simulatedConsciousnessService.update(simulatedConsciousness.id, data);
                message = 'Simulated Consciousness updated';
            } 
            else 
            {
                await simulatedConsciousnessService.create(data);
                message = 'Simulated Consciousness added';
            }
            window.location.href = '/simulatedconsciousnesses';
          //  router.push(`/simulatedconsciousnesses`);
            alertService.success(message, true);
        } 
        catch (error: any) 
        {
            alertService.error(error);
        }
    }

    const deleteConsciousness = (id: any) => {
        var c = confirm("Are you sure you want to delete this Simulated Consciousness?");
        if (c) {
            simulatedConsciousnessService.delete(simulatedConsciousness.id);
            window.location.href = '/simulatedconsciousnesses';
           // router.push('/simulatedconsciousnesses');
        }
    }

    return (
        <>
        {
            simulatedConsciousness!= null &&
            <>
                <h1 className='tw-text-2xl tw-font-bold'>Edit {simulatedConsciousness.name} 
                <button onClick={() => deleteConsciousness(simulatedConsciousness.id)} className="btn btn-sm btn-danger btn-delete-user" style={{ width: '60px' }} disabled={simulatedConsciousness.isDeleting}>
                {
                    simulatedConsciousness.isDeleting
                    ? <span className="spinner-border spinner-border-sm"></span>
                    : <span>Delete</span>
                }
                </button>
                </h1>
            </>
        }
        {
            simulatedConsciousness == null &&
            <h1 className='tw-text-2xl tw-font-bold'>Add Simulated Consciousness</h1>
        }
        <div className="tw-p-4 tw-w-full tw-mx-auto tw-bg-white tw-rounded-lg tw-shadow-md">
            <h1 className='tw-text-2xl tw-font-bold tw-text-center tw-mb-4'>{simulatedConsciousness ? `Edit ${simulatedConsciousness.name}` : 'Add a Simulated Consciousness'}</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="tw-space-y-4">
                <div >
                    <label className='tw-block tw-font-bold'>Consciousness Name:</label>
                    <input {...fields.name} type="text" placeholder="Name of Consciousness to Simulate" onInput={handleNameChange} className={`tw-form-control tw-p-2 tw-rounded-md tw-w-full ${errors.name ? 'tw-border-red-500' : 'tw-border-gray-300'}`} />
                    <ActionButton 
                            className={`${runConsciousnessCreationTaskRunning ? 'tw-bg-gray-400' : 'tw-bg-gray-8000'} rounded-l-none ml-[1px] btn btn-primary tw-border hover:tw-bg-gray-800 tw-border-black tw-text-white tw-bg-black tw-shadow tw-mt-2`} 
                            disabled={runConsciousnessCreationTaskRunning}
                            onClick={async () => {
                                setRunConsciousnessCreationTaskRunning(true);
                                await runConsciousnessCreationTask.run(context);
                                setRunConsciousnessCreationTaskRunning(false);
                            }}
                            >
                        <div className='tw-flex tw-items-center'>Automated Consciousness Creator <SparklesIcon className={`${runConsciousnessCreationTaskRunning ? 'tw-animate-spin' : ''} tw-font-bold tw-pl-1 tw-h-6 tw-w-6`} /></div>
                    </ActionButton> 
                    {errors.name && typeof errors.name.message === 'string'  && <div className="tw-text-red-500 tw-text-sm">{errors.name.message}</div>}
                </div>

                <div>
                    <label className='tw-block tw-font-bold'>Description:</label>
                    <textarea {...fields.description} placeholder={"This is the simulated consciousness of '" +  consciousnessName ?? simulatedConsciousness?.name + "'..."} className={`tw-form-control tw-p-2 tw-rounded-md tw-w-full ${errors.description ? 'tw-border-red-500' : 'tw-border-gray-300'}`} />
                    {errors.description && typeof errors.description.message === 'string'  && <div className="tw-text-red-500 tw-text-sm">{errors.description.message}</div>}
                </div>

                {curUser?.admin &&
                    <div>
                        <label className='tw-block tw-font-bold'>Assistant ID:</label>
                        <input {...fields.assistantId} type="text" placeholder="Assistant ID" className={`tw-form-control tw-p-2 tw-rounded-md tw-w-full ${errors.assistantId ? 'tw-border-red-500' : 'tw-border-gray-300'}`} />
                        {errors.assistantId && typeof errors.assistantId.message === 'string'  && <div className="tw-text-red-500 tw-text-sm">{errors.assistantId.message}</div>}
                    </div>
                }

                <div>
                    <label className='tw-block tw-font-bold'>Personality Code:</label>
                    <textarea {...fields.personality} placeholder={`You are ${simulatedConsciousness?.name}. Your favorite color is...`} className={`tw-h-32 tw-form-control tw-p-2 tw-rounded-md tw-w-full ${errors.personality ? 'tw-border-red-500' : 'tw-border-gray-300'}`} style={{ resize: 'both' }} />
                    {errors.personality && typeof errors.personality.message === 'string'  && <div className="tw-text-red-500 tw-text-sm">{errors.personality.message}</div>}
                </div>
                
                {curUser?.admin &&
                    <div>
                        <label className='tw-block tw-font-bold'>Core Identity to Site:</label>
                        <input {...fields.isCore} onChange={handleCoreChange} type="checkbox" className={`tw-form-control tw-h-6 tw-w-6 checked:tw-bg-black hover:tw-bg-black active:tw-bg-gray-400 tw-p-3 tw-m-4 tw-bg-gray-400 tw-p-2 tw-border-2 tw-border-white tw-border-opacity-50 tw-rounded-md tw-p-2 tw-text-white tw-text-lg tw-p-2 tw-rounded-md ${errors.isCore ? 'tw-border-red-500' : 'tw-border-gray-300'}`} />
                        {errors.isCore && typeof errors.isCore.message === 'string'  && <div className="tw-text-red-500 tw-text-sm">{errors.isCore.message}</div>}
                    </div>
                }

                <div>
                    <label className='tw-block tw-font-bold'>Share to all users:</label>
                    <input {...fields.isPublic} onChange={handlePublicChange} type="checkbox" className={`tw-form-control tw-h-6 tw-w-6 checked:tw-bg-black hover:tw-bg-black active:tw-bg-gray-400 tw-p-3 tw-m-4 tw-bg-gray-400 tw-p-2 tw-border-2 tw-border-white tw-border-opacity-50 tw-rounded-md tw-p-2 tw-text-white tw-text-lg tw- tw-p-2 tw-rounded-md ${errors.isPublic ? 'tw-border-red-500' : 'tw-border-gray-300'}`} />
                    {errors.isPublic && typeof errors.isPublic.message === 'string'  && <div className="tw-text-red-500 tw-text-sm">{errors.isPublic.message}</div>}
                </div>

                <div className="tw-flex tw-justify-between tw-items-center">
                    <button type="submit" disabled={formState.isSubmitting} className="tw-bg-blue-500 hover:tw-bg-blue-700 tw-text-white tw-font-bold tw-py-2 tw-px-4 tw-rounded-full tw-shadow-md">
                        {formState.isSubmitting && <span className="tw-spinner-border tw-spinner-border-sm tw-mr-1"></span>}
                        Save
                    </button>
                    <button onClick={() => reset()} type="button" disabled={formState.isSubmitting} className="tw-bg-gray-300 hover:tw-bg-gray-400 tw-text-black tw-font-bold tw-py-2 tw-px-4 tw-rounded-full tw-shadow-md">
                        Reset
                    </button>
                    <Link href="/simulatedconsciousnesses" className="tw-bg-transparent hover:tw-bg-gray-200 tw-text-blue-500 tw-font-bold tw-py-2 tw-px-4 tw-rounded-full tw-shadow-md">
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    </>
    );
}

export interface ConsciousnessModel  {
    name: string;
    description: string;  
    uniqueAttribute: string;
    communication: string;
    baseDirectives: string;
    history: string;
    personality: string;
    relationships: string;
    work: string;
  }

