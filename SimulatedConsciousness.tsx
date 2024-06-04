'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Speak, Hush } from "../../../../_components/common/CodeMusai/TemporalLobe/AuditoryCortex"
import { Chat } from "../../../../_components/common/CodeMusai/TemporalLobe/LanguageCenters"
import { useAlertService, useUserService, useUserSettingService, IUserSetting, useSimulatedConsciousnessService, ISimulatedConsciousness } from '../../../../_services';
import { useCopilotAware } from "../../../../_components/common/CommonComponents";
import { Message } from "@copilotkit/shared";
import { debugLog } from '../../../../_helpers/client';
import ConsciousnessThreads from './ConsciousnessThreads'
import ConsciousnessSelector, { Consciousness } from './ConsciousnessSelector';

export { SimulatedConsciousness }
function SimulatedConsciousness() 
{
    const [loaded, setLoaded] = useState(false); 
    const [sessionMemoryId_Consciousness1, setSessionMemoryId_Consciousness1] = useState<string>(""); 
    const [sessionMemoryId_Consciousness2, setSessionMemoryId_Consciousness2] = useState<string>(""); 

    const [consciousness1, setConsciousness1] = useState<Consciousness | null>(null); 
    const [consciousness2, setConsciousness2] = useState<Consciousness | null>(null); 

    const [consciousness1WithCodeMusai, setConsciousness1WithCodeMusai] = useState<boolean>(false);
    const [consciousness2WithCodeMusai, setConsciousness2WithCodeMusai] = useState<boolean>(false); 

    

    const [consciousness1newMessage, setConsciousness1newMessage] = useState('');
    const [consciousness2newMessage, setConsciousness2newMessage] = useState('');

    const [conversationContextOnly, setConversationContextOnly] = useState('');

    const [threadSettings, setThreadSettings] = useState<IUserSetting[]>([]);
    const [consciousness1ThreadSettings, setConsciousness1ThreadSettings] = useState<IUserSetting[]>([]);
    const [consciousness2ThreadSettings, setConsciousness2ThreadSettings] = useState<IUserSetting[]>([]);

    const [systemMessage, setSystemMessage] = useState('');

    const [endConversation, setEndConversation] = useState(false);

    const userService = useUserService();
    //const users = userService.users;
    const curUser = userService.currentUser;
    const alertService = useAlertService();

    debugLog("Loading User Setting Services...");
    const userSettingService = useUserSettingService();
    const userSettings = userSettingService.userSettings;

    debugLog("Loading Simulated Consciousness Services...");
    const simulatedConsciousnessService = useSimulatedConsciousnessService();
    const simulatedConsciousnesses = simulatedConsciousnessService.simulatedConsciousnesses;

    useCopilotAware(`${consciousness1?.name} ${consciousness2?`${consciousness2.name}`:""} ${conversationContextOnly}`);
    useCopilotAware(`${consciousness2?.name}: ${consciousness2newMessage}`);
    useCopilotAware(`${consciousness1?.name}: ${consciousness1newMessage}`);

    useEffect(() => {
        if (!curUser)
        {
            userService.getCurrent();
        }

        if (!simulatedConsciousnesses)
        {
            debugLog('Getting Simulated Consciousnesses');
            simulatedConsciousnessService.getAllForUser(Number(curUser?.id)); //getAll();
        }

        if (curUser?.id !== undefined && !userSettings) 
        {
            debugLog('Getting Settings')
            userSettingService.getAllForUser(Number(curUser.id));
        }

        if (userSettings && userSettings.length > 0) {
            debugLog('Finding Consciousness Threads' + userSettings.length)
            const filteredSettings = userSettings
                    .filter((setting: IUserSetting) => setting.settingName && setting.settingName.includes('.ChatThread'))
                    .sort((a, b) => a.settingName.localeCompare(b.settingName));
            debugLog("User Threads:" + JSON.stringify(filteredSettings));
            setThreadSettings(filteredSettings);
        }

        
    }, [curUser, userSettings, simulatedConsciousnesses]);
    
    useEffect(() => {
        if (consciousness1 && consciousness1.name != '' && threadSettings && threadSettings.length > 0) {
            debugLog('Finding Treads for Consciousnesses ' + consciousness1);
            const filteredSettings = threadSettings.filter((setting: IUserSetting) => setting.settingName && setting.settingName.includes(`${consciousness1.name}.ChatThread`));

            debugLog(`${consciousness1.name} Threads:`  + JSON.stringify(filteredSettings));
            setConsciousness1ThreadSettings(filteredSettings);

        }
    }, [consciousness1]); 

    useEffect(() => {
        if (consciousness2 && consciousness2.name != '' && threadSettings && threadSettings.length > 0) {
            debugLog('Finding Threads for Consciousnesses ' + consciousness2);
            const filteredSettings = threadSettings.filter((setting: IUserSetting) => setting.settingName && setting.settingName.includes(`${consciousness2.name}.ChatThread`));

            debugLog(`${consciousness2.name} Threads: ` + JSON.stringify(filteredSettings));
            setConsciousness2ThreadSettings(filteredSettings);
        }
    }, [consciousness2]); 
    


    const newConscious1Message = (newMessage: Message) => {
        debugLog("New message: " + JSON.stringify(newMessage));
        if (consciousness1 && consciousness2 && !endConversation) //triggers dialog
        {
            setConsciousness2newMessage(newMessage.content);
        }
        else
        {
            setConversationContextOnly(newMessage.content); 
        }
    }

    const newConscious2Message = (newMessage: Message) => {
        debugLog("New message: " + JSON.stringify(newMessage));
        if (!endConversation)
        {
            setConsciousness1newMessage(newMessage.content);
        }
        else
        {
            setConversationContextOnly(newMessage.content);
        }
    }

    const handleConsciousnessChange = ({ consciousness1, consciousness2 }: { consciousness1: Consciousness | null, consciousness2: Consciousness | null }) => {
        if (consciousness1 != null)
    
        {
            debugLog("Setting Consciousness 1 Name:" + JSON.stringify(consciousness1));
            setConsciousness1(consciousness1);
        }
        setEndConversation(false);
        if (consciousness2 != null)
        {
            debugLog("Setting Consciousness 2 Name:" + JSON.stringify(consciousness2));
            setConsciousness2(consciousness2);
        }
         
        if ((consciousness1 != null || consciousness2 != null) && (sessionMemoryId_Consciousness1 != '' || sessionMemoryId_Consciousness2 != '')) {
            setLoaded(true);
        } else {
            setLoaded(false);
        }
    }
    const handleConsciousness1WithCodeMusaiSelect = (usingCodeMusai: boolean) => {
        setConsciousness1WithCodeMusai(usingCodeMusai);
    }

    const handleConsciousness2WithCodeMusaiSelect = (usingCodeMusai: boolean) =>
    {
        setConsciousness2WithCodeMusai(usingCodeMusai);
    }

    const handleSessionSelectConsciousness1 = ({ sessionId }: { sessionId: string }) => {
        if (!sessionId)
        {
            return;
        }
        debugLog("Starting Chat with "+ consciousness1?.name +" Session Selected: " + sessionId);
        setSessionMemoryId_Consciousness1(sessionId);
        setEndConversation(false);

        var sysMessage = '';
        var settingLookup : IUserSetting[] = consciousness1ThreadSettings.filter((setting: IUserSetting) => setting.settingName && setting.settingName == (`${consciousness1?.name}.ChatThread_${sessionId}`));
        if (settingLookup.length > 0 && settingLookup[0].settingDescription.split('|').length > 1)
        {
            sysMessage = settingLookup[0].settingDescription.split('|')[1];
            setSystemMessage(sysMessage);
        }
        
        
        debugLog("Session Set");
    
        if ((consciousness1 != null || consciousness2 != null) && sessionId != null) {
            setLoaded(true);
            debugLog("Loaded");
        } else {
            setLoaded(false);
            debugLog("Not Loaded");
        }
    }

    const handleSessionSelectConsciousness2 = ({ sessionId }: { sessionId: string }) => {
        if (!sessionId)
        {
            return;
        }
        debugLog("Starting Chat with "+ consciousness1?.name +" Session Selected: " + sessionId);
        setSessionMemoryId_Consciousness2(sessionId);
        debugLog("Session Set");
        setEndConversation(false);

        var sysMessage = '';
        var settingLookup : IUserSetting[] = consciousness1ThreadSettings.filter((setting: IUserSetting) => setting.settingName && setting.settingName == (`${consciousness1?.name}.ChatThread_${sessionId}`));       
        if (settingLookup.length > 0 && settingLookup[0].settingDescription.split('|').length > 1)
        {
            sysMessage = settingLookup[0].settingDescription.split('|')[1];
            setSystemMessage(sysMessage);
        }
    
        if ((consciousness1 != null || consciousness2 != null) && sessionId != null) {
            setLoaded(true);
            debugLog("Loaded");
        } else {
            setLoaded(false);
            debugLog("Not Loaded");
        }
    }   

    const handleSystemMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log("System Message Changed: " + event.target.value);
        setSystemMessage(event.target.value);
    };

    debugLog("Current Consciousness1:" + JSON.stringify(consciousness1));
    debugLog("Current Consciousness2:" + JSON.stringify(consciousness2));

    if (!curUser || !userSettings || !simulatedConsciousnesses ) {
        return <div>Loading...</div>;
    }

    return (
        <>
                <div>
                    <ConsciousnessSelector simulatedConsciousnesses={simulatedConsciousnesses as ISimulatedConsciousness[]} onConsciousnessChange={handleConsciousnessChange} />
                    <ConsciousnessThreads consciousness={consciousness1} threadSettings={consciousness1ThreadSettings} usingCodeMusaiAISelect={handleConsciousness1WithCodeMusaiSelect} onSessionSelect={handleSessionSelectConsciousness1} />
                    <ConsciousnessThreads consciousness={consciousness2} threadSettings={consciousness2ThreadSettings} usingCodeMusaiAISelect={handleConsciousness2WithCodeMusaiSelect} onSessionSelect={handleSessionSelectConsciousness2} />
                </div>

                {loaded ? (
                        <>
                        <div>
                            <label htmlFor="systemMessageInput">System Message:</label>
                            <input
                                id="systemMessageInput"
                                className="tw-bg-black tw-rounded-md tw-p-2 tw-w-full tw-mt-2 tw-text-lg tw-text-white tw-border-2 tw-border-white tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-blue-500"
                                type="text"
                                value={systemMessage}
                                onChange={handleSystemMessageChange}
                                placeholder="Discuss your life with eachother..."
                            />
                        </div>
                            {consciousness1 != null && (
                                <div>
                                    <h1 className='tw-text-2xl'>Simulated Consciousness Dialog:</h1>
                                    <h3 className='tw-text-lg'>Start the interaction through sending a message, and allow the two to interact.</h3>
                                    <br/>
                                    <h1 className='tw-text-xl tw-flex tw-justify-center tw-items-center'>{consciousness1.name??""} chat with {consciousness2?.name??curUser?.firstName??""}</h1>
                                    <h2 className='tw-text-lg tw-flex tw-justify-center tw-items-center'>{systemMessage??""}</h2>
                                    <hr/><br/>
                                    <div className='tw-flex tw-justify-center tw-items-center tw-h-screen tw-bg-gray-900 tw-rounded'> 
                                        <div className='tw-rounded tw-p-4 tw-w-[50%]'>
                                            
                                            <Chat 
                                                placeholder={consciousness2 ? `${('Would do you want to ask '+consciousness1.name+', '+consciousness2.name || '').trim() + '?'}` : `${('Would do you want to ask '+consciousness1.name+', '+curUser?.firstName || '').trim() + '?'}`} 
                                                systemMessage={`You are ${consciousness1.name??""}, and you are now interacting with me, I am ${curUser?.firstName??""}. ` + systemMessage} 
                                                usersName={`${curUser?.firstName}`} 
                                                simulatedConsciousness={consciousness1} 
                                                withCodeMusai={consciousness1WithCodeMusai}
                                                onNewMessage={newConscious1Message} 
                                                newConsciousnessMessage={consciousness2 ? consciousness1newMessage : undefined} 
                                                sessionMemoryId={sessionMemoryId_Consciousness1 ?? "1"} 
                                                userId={curUser?.id}
                                                threadName={consciousness2 ? 'Session ' + sessionMemoryId_Consciousness1 + ': Conversation with ' + consciousness2 + ' on ' + new Date().toLocaleDateString() + ", discussing| " + systemMessage
                                                                            : 'Session ' + sessionMemoryId_Consciousness1 + ': Conversation with ' + curUser?.firstName + ' on ' + new Date().toLocaleDateString() + ", discussing| " + systemMessage}
                                            />
                                        </div>
                                        {consciousness2 != null && (
                                            <>
                                                <hr/>
                                                <div className='tw-rounded tw-p-4 tw-w-[50%]'>
                                                    <Chat 
                                                        placeholder={`${('Would do you want to ask '+ consciousness2.name +', '+consciousness1.name || '').trim() + '?'}`} 
                                                        systemMessage={`You are ${consciousness2.name ?? ""}, and you are now interacting with me, I am ${consciousness1.name ?? ""}. ` + systemMessage} 
                                                        usersName={`${curUser?.firstName}`} 
                                                        simulatedConsciousness={consciousness2} 
                                                        withCodeMusai={consciousness2WithCodeMusai}
                                                        onNewMessage={newConscious2Message} 
                                                        newConsciousnessMessage={consciousness2newMessage} 
                                                        sessionMemoryId={sessionMemoryId_Consciousness2 ?? "1"}  
                                                        userId={curUser?.id}
                                                        threadName={'Session ' + sessionMemoryId_Consciousness2 + ': Conversation with ' + consciousness1.name + ' on ' + new Date().toLocaleDateString() + ", discussing| " + systemMessage}
                                                        actAsSecond={true}
                                                    />
                                                </div>
                                            </>
                                        )}
                                        
                                    </div> 
                                    {consciousness1 && consciousness2 && (consciousness1newMessage != '' || consciousness2newMessage != '') && (
                                            <div>
                                                <button className='tw-bg-red-500 tw-text-white tw-p-2 tw-rounded tw-border-2 tw-border-white' onClick={() => setEndConversation(true)}>End Conversation</button>
                                            </div>
                                    )}
                                    {endConversation && (
                                        <div className='tw-flex tw-justify-center tw-items-center tw-h-screen tw-bg-gray-900 tw-rounded'>
                                            <h1 className='tw-text-2xl tw-text-white'>Conversation Ended</h1>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
) : (
    <div><br/>Choose your consciousnesses</div>
)}
        </>
    ); 
}
