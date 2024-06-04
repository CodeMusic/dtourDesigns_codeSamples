'use client';
import React from 'react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Spinner } from '../../../_components/common/Spinner';
import { useUserService } from '../../../_services/useUserService';
import { useGenerativeResultService } from '../../../_services/useGenerativeResultService';
import { formatDate } from '../../../_helpers/common/formatHelpers'; 
import { SparklesIcon } from '@heroicons/react/24/outline';

export { ListGenerativeResults }// <Link href={`/users/edit/${project.id}`} className="btn btn-sm btn-primary me-1">Edit</Link>
function ListGenerativeResults() 
{
/*
    console.log("Loading User Services...");
    const userService = useUserService();
    const users = userService.users;
    const curUser = userService.currentUser;

                <h1 className='tw-text-2xl tw-font-bold'>Projects</h1>
            {   curUser?.admin &&
                <Link className='btn btn-sm btn-success mb-2' href="/projects/add">Add Project</Link>
            }
*/
    console.log("Loading Generative Result Services...");
    const generativeResultService = useGenerativeResultService();
    interface GenerativeResult {
        id: { value: string };
        title: string;
        createdAt: Date;
        type: string;
    }

    const [generativeResults, setGenerativeResults] = useState<any>();
    const [count, setCount] = useState(0);

    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(28);
    const [totalPages, setTotalPages] = useState(0); // Set this based on your data
    const [showAll, setShowAll] = useState(false);

    function getTypeColor(type: string): string {
        switch (type) {
            case 'Code':
                return 'tw-text-green-500'; 
            case 'Lecture':
                return 'tw-text-red-500'; 
            case 'Poem':
                return 'tw-text-blue-500'; 
            case 'Story':
                return 'tw-text-orange-500'; 
            case 'Prophecy':
                return 'tw-text-black'; 
            case 'Song':
                return 'tw-text-purple-500'; 
            case 'Music':
                return 'tw-text-teal-500'; 
            case 'Comedy':
                return 'tw-text-yellow-700'; 
            default:
                return 'tw-text-gray-500'; 
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            const data = await generativeResultService.getAllPartial(limit, currentPage);
            console.log('Complete data:', data);
            console.log('Rows data:', data.rows);

            setGenerativeResults(data.rows);
            setCount((data.rows as any).totalCount || 0); // Fallback to 0 if count is undefined
            console.log('Count:', (data.rows as any).totalCount);
            setTotalPages(Math.ceil(((data.rows as any).totalCount || 0) / limit));
            console.log('Total Pages:', totalPages);
        };
    
        fetchData();
    }, [currentPage, limit]);
    

    useEffect(() => {
        //userService.getCurrent();
        generativeResultService.getAllPartial(limit, currentPage);
    }, []);

    return (
        <>
            <h1 className='tw-text-2xl tw-font-bold tw-flex'>Generative Results<SparklesIcon className="tw-justify-between tw-w-6 tw-h-6 tw-text-blue-500" /></h1>
            <div className='tw-hidden tw-flex tw-justify-between tw-bg-gray-200 tw-p-2 tw-rounded-md'>
                <label>Show All</label>
                <input type="checkbox" className='tw-w-4 tw-h-4' value={showAll.toString()} onChange={(e) => setShowAll(e.target.checked)} />
                <label>Limit</label>
                <input type="number" className='tw-w-10' value={limit} onChange={(e) => setLimit(parseInt(e.target.value, 10) > 10 ? parseInt(e.target.value, 10) : 10)} />
                <button onClick={() => generativeResultService.getAllPartial(0, limit)}>Get</button>
            </div>
            <div className="tw-grid tw-grid-cols-4 tw-gap-4 tw-mt-4 tw-shadow-lg tw-rounded-lg tw-bg-gray-100 tw-rounded-lg">
                    <DataBody />
            </div>
            {totalPages > 1 &&
                <div className='tw-flex tw-justify-between tw-bg-gray-200 tw-p-2 tw-rounded-md'>
                    <button className='btn btn-sm btn-primary' onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
                    <span> Page {currentPage} of {totalPages} </span>
                    <button className='btn btn-sm btn-primary' onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages}>Next</button>
                </div>
            }

        </>
    );

    function stripMarkdown(theMarkdown: string)
    { 
        var content = "<p>";
        content += theMarkdown ?? "";
        content += "</p>";
        var div = document.createElement("div");
        div.innerHTML = content;
        return div.textContent || div.innerText || "";
    }

    function DataBody() 
    {
        if (generativeResults?.rows?.length) 
        {
            return (generativeResults.rows.map((generativeResult: GenerativeResult) =>
            <Link 
                className='tw-rounded-lg tw-shadow tw-border tw-border-black'
                style={{ textDecoration: 'none' }} 
                href={`/generativeresults/view/${(generativeResult.id as any).value.toString()}`} 
                key={(generativeResult.id as any).value.toString()}>
                    <div className="tw-bg-white tw-p-4 tw-cursor-pointer hover:tw-bg-blue-200 tw-h-full tw-w-full">
                        <div className="tw-font-xl tw-text-gray-900">
                            {stripMarkdown(generativeResult.title)}
                        </div>
                        
                        <div className={`tw-text-sm ${getTypeColor(generativeResult.type)}`}>
                            {generativeResult.type}
                        </div>
                        <div className="tw-text-sm tw-text-gray-500 tw-italic">
                            {formatDate((generativeResult as any).createdAt)}
                        </div>
                    </div>
                </Link>
            ));
        }        
        else if (generativeResults?.rows?.length === 0) {
            return (
                <div className="tw-bg-white tw-p-4 tw-cursor-pointer hover:tw-bg-gray-200">
                    <div className="tw-font-medium tw-text-gray-900">No Generative Results To Display</div>
                </div>
            );
        }             
        else if (!generativeResultService.generativeresultsPartial) 
        {
            return (
                <div className="tw-bg-white tw-p-4 tw-cursor-pointer hover:tw-bg-gray-200 tw-w-full">
                    <Spinner />
                </div>
            );
        }
    }
}


/**
 import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Spinner } from '_components/common/Spinner';
import { useGenerativeResultService, IGenerativeResult } from '_services/useGenerativeResultService';
import { formatDate } from '_helpers/common/formatHelpers';

export { ListGenerativeResults }
function ListGenerativeResults() {
    console.log("Loading Generative Result Services...");
    const generativeResultService = useGenerativeResultService();


    const [generativeResults, setGenerativeResults] = useState<IGenerativeResult[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [totalPages, setTotalPages] = useState(0);
    const [showAll, setShowAll] = useState(false);

    

    useEffect(() => {
        const fetchData = async () => {
            generativeResultService.getAllPartial(limit, currentPage); //const data = await 
            //console.log('Complete data:', data);
            //console.log('Rows data:', data.rows);

          //  setGenerativeResults(data.rows);
          //  setTotalPages(Math.ceil(((data.rows as any).totalCount || 0) / limit));
        };
    
        fetchData();
    }, [currentPage, limit]);

    useEffect(() => {
        console.log('Generative Results:', generativeResults);
        setGenerativeResults(generativeResultService?.generativeresultsPartial?.rows || []);
        setTotalPages(Math.ceil(((generativeResultService?.generativeresultsPartial?.rows as any)?.totalCount || 0) / limit));
    }, [generativeResultService.generativeresultsPartial]);

    function stripMarkdown(theMarkdown: string) { 
        var content = "<p>";
        content += theMarkdown ?? "";
        content += "</p>";
        var div = document.createElement("div");
        div.innerHTML = content;
        return div.textContent || div.innerText || "";
    }

    if (!generativeResults) 
    {
        return (
            <tr>
                <td colSpan={4}>
                    <Spinner />
                </td>
            </tr>
        );
    }
    else if (generativeResults?.length === 0) {
        return (
            <tr>
                <td colSpan={4} className="text-center">
                    <div className="p-2 text-lg">No Generative Results To Display</div>
                </td>
            </tr>
        );
    }             
    
    else 
    {
        return (
            <>
            
                <div className='tw-hidden tw-flex tw-justify-between tw-bg-gray-200 tw-p-2 tw-rounded-md'>
                    <label>Show All</label>
                    <input type="checkbox" className='tw-w-4 tw-h-4' value={showAll.toString()} onChange={(e) => setShowAll(e.target.checked)} />
                    <label>Limit</label>
                    <input type="number" className='tw-w-10' value={limit} onChange={(e) => setLimit(parseInt(e.target.value, 10) > 10 ? parseInt(e.target.value, 10) : 10)} />
                    <button onClick={() => generativeResultService.getAllPartial(0, limit)}>Get</button>
                </div>
                <div className="tw-grid tw-grid-cols-4 tw-gap-4 tw-mt-4 tw-shadow-lg tw-rounded-lg tw-bg-gray-100">
                {generativeResults && generativeResults.map((generativeResult: IGenerativeResult) => (
                        <Link href={`/generativeresults/view/${(generativeResult.id as any).value.toString()}`} key={(generativeResult.id as any).value.toString()}>
                            <div className="tw-bg-white tw-p-4 tw-cursor-pointer hover:tw-bg-gray-200">
                                <div className="tw-font-medium tw-text-gray-900">{stripMarkdown(generativeResult.title)}</div>
                                <div className="tw-text-sm tw-text-gray-500">{formatDate((generativeResult as any).createdAt)}</div>
                                <div className="tw-text-sm tw-text-gray-500">{generativeResult.type}</div>
                            </div>
                        </Link>
                    ))}
                </div>
                {totalPages > 1 &&
                    <div className='tw-flex tw-justify-between tw-bg-gray-200 tw-p-2 tw-rounded-md'>
                        <button className='btn btn-sm btn-primary' onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
                        <span> Page {currentPage} of {totalPages} </span>
                        <button className='btn btn-sm btn-primary' onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages}>Next</button>
                    </div>
                }
            </>
        );
    }

}

 */