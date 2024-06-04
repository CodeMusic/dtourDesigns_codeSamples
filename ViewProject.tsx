'use client';
import React from 'react';
import Image from 'next/image'
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAlertService, useProjectService, useUserService } from '../../../_services';
import { formatDate } from '../../../_helpers/common/formatHelpers'; 
//ProtoTypes
import { CodeMusicAI } from '../../../_components/secure/prototypes/CodeMusicAI';
import { ResumeAITask } from '../../../_components/secure/prototypes/Automation/ResumeAITask';
import { ContextWriter } from '../../../_components/secure/prototypes/ContextWriter';
import { GenerativeCode } from '../../../_components/secure/prototypes/GenerativeCode/GenerativeCode';
import { Sandbox } from '../../../_components/secure/prototypes/Sandbox';

import { useCopilotAware } from "../../../_components/common/CommonComponents";
import ResearchTask from '../../../_components/secure/prototypes/Automation/ResearchTask';
import DoctorAnalysisTask from '../../../_components/secure/prototypes/Automation/DoctorAnalysisTask';
import { IdeaAssistantTask } from '../../../_components/secure/prototypes/Automation/IdeaAssistantTask';
import StoryCreatorTask from '../../../_components/secure/prototypes/Automation/StoryCreatorTask';
import MoodToDrinkTask from '../../../_components/secure/prototypes/Automation/MoodToDrinkTask';
import RecipeCreationTask from '../../../_components/secure/prototypes/Automation/RecipeCreationTask';
import PoetryMakerTask from '../../../_components/secure/prototypes/Automation/PoetryMakerTask'
import ProphecyMakerTask from '../../../_components/secure/prototypes/Automation/ProphecyMakerTask'
import BibleClarityTask from '../../../_components/secure/prototypes/Automation/BibleClarityTask'
import SongMakerTask from '../../../_components/secure/prototypes/Automation/SongMakerTask'
import AITeachterTask from '../../../_components/secure/prototypes/Automation/AITeachterTask'
import MakeItFunnyTask from '../../../_components/secure/prototypes/Automation/MakeItFunnyTask'
import MakeItTask from '../../../_components/secure/prototypes/Automation/MakeItTask'
import { MusicalCreationTask } from '../../../_components/secure/prototypes/Automation/MusicCreationTask';
import { SimulatedConsciousness } from '../../../_components/secure/prototypes/SimulatedConsciousness/SimulatedConsciousness'
import PersonaPhraseTask from '../../../_components/secure/prototypes/Automation/PersonaPhraseTask'

export { ViewProject };
function ViewProject({ title, project }: { title: string, project?: any }) 
{
    const router = useRouter();
    const alertService = useAlertService();
    const projectService = useProjectService();
    const userService = useUserService();
    const users = userService.users;
    const curUser = userService.currentUser;

    useCopilotAware(project);

    return (
        <div className="tw-max-w-full tw-mx-auto tw-p-4">
            <div className="tw-bg-white tw-shadow-md tw-rounded-lg tw-p-6">
                {curUser?.admin &&
                    <Link href={`/projects/edit/${project.id}`} className="tw-btn tw-btn-primary tw-mb-4">Edit</Link>
                }
                <h1 className='tw-text-2xl tw-font-bold'>{project.name} - v{project?.version ?? "0.0.0"}</h1>
                <div className="tw-flex tw-justify-center tw-my-4">
                    <Image className='tw-rounded-lg' src={project.image} width={200} height={200} alt="Project Image" />
                </div>
                <h2 className='tw-text-xl tw-font-bold'>{project.progress}% complete!</h2>
                <p className='tw-text-sm tw-italic'>Created: {formatDate(project.createdAt)}</p>
                <p className='tw-text-sm tw-italic'>Last Updated: {formatDate(project.updatedAt)}</p>
                <h3 className='tw-text-lg tw-mt-4'>{project.description}</h3>
                {project.protoId && 
                    <div className="tw-mt-4">
                        {renderPrototypeComponent(project.protoId)}
                    </div>
                }
            </div>
        </div>
    );

    function renderPrototypeComponent(protoId: string) {
        switch (protoId) {
            case "pId_CodeMusicAI":
                return <CodeMusicAI />;
            case "pId_ResumeAI":
                return <ResumeAITask />;
            case "pId_ContextWriter":
                return <ContextWriter />;
            case "pId_GenerativeCode":
                return <GenerativeCode />;
            case "pId_Sandbox":
                return <Sandbox />;
            case "pId_Research":
                return <ResearchTask />;
            case "pId_DoctorAnalysisTask":
                return <DoctorAnalysisTask />;
            case "pId_IdeaAssistantTask":
                return <IdeaAssistantTask />;
            case "pId_StoryCreatorTask":
                return <StoryCreatorTask />;
            case "pId_MoodToDrinkTask":
                return <MoodToDrinkTask />;
            case "pId_RecipeCreationTask":
                return <RecipeCreationTask />;
            case "pId_PoetryMakerTask":
                return <PoetryMakerTask />;
            case "pId_ProphecyMakerTask":
                return <ProphecyMakerTask />;
            case "pId_BibleClarityTask":
                return <BibleClarityTask />;
            case "pId_SongMakerTask":
                return <SongMakerTask />;
            case "pId_AITeachterTask":
                return <AITeachterTask />;
            case "pId_MakeItFunnyTask":
                return <MakeItFunnyTask />;
            case "pId_MakeItTask":
                return <MakeItTask />;
            case "pId_MusicCreationTask":
                return <MusicalCreationTask />;
            case "pId_SimulatedConsciousnessInteraction":
                return <SimulatedConsciousness />;
            case "pId_PersonaPhraseTask":
                return <PersonaPhraseTask />;
            default:
                return null;
        }
    }
}