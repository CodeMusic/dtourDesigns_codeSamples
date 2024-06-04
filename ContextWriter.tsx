'use client';
import React, { useState } from 'react';
import { CopilotTextarea, HTMLCopilotTextAreaElement } from "@copilotkit/react-textarea";
import { useCopilotAware } from "../../../_components/common/CommonComponents";
import { CopilotTextareaComponent, CopilotContextEntry, CopilotContextEntryGrow, AutoGrowTextArea } from "../../../_components/common/CommonComponents";

export { ContextWriter }
function ContextWriter() 
{
    const [value, setValue] = React.useState('')
    const [textarea, setTextarea] = React.useState('')
    const [purpose, setPurpose] = React.useState('')
    useCopilotAware("Purpose: " + purpose);
    //gpt-3.5-turbo
    return (
        <>
        <div>
        <label htmlFor="address">Purpose</label><br/> 
                  <input className='tw-p-2 tw-border tw-border-black tw-text-white tw-text-lg tw-bg-gray-700 tw-shadow tw-mt-2 tw-rounded'
                                            value={purpose} 
                                            onChange={(e) => {
                                              setPurpose(e?.target?.value ?? "");
                                            }} 
                                            placeholder="Purpose of auto AI writing... (eg. email to boss, letter to friend, etc)" />  
        </div>
            <div>
            <label className="tw-block">Context Entry:</label>
            <CopilotContextEntryGrow className='tw-w-full tw-p-2 tw-border tw-border-black tw-text-white tw-text-lg tw-bg-gray-700 tw-shadow tw-mt-2 tw-rounded' value={textarea} onChange={(e) => setTextarea(e.target.value)} maxRows={25} autoFocus={true} />
            </div>

            <label className="tw-block" >Context Writer:</label>
            <CopilotTextareaComponent 
            placeholder="... Start writing here, pause, and watch the AI help you write the rest. Use tab to accept the AI's suggestion." 
            purpose={purpose}
            className="tw-form-control tw-border tw-border-gray-300 tw-rounded-md tw-p-1" 
            //autosuggestionsConfig={{ textareaPurpose: 'chat', chatApiConfigs: { openai: { model: 'gpt-4-0125-preview' } } as any }} />    
             />
            
   

        </>
    );

}
