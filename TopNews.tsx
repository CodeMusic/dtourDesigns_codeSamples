'use client';
import React, { useEffect, useState } from 'react'; // Add this line at the top of your file
import Image from 'next/image'
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useNewsService } from '../../../_services';
import { formatDate } from '../../../_helpers/common/formatHelpers'; 
import { SparklesIcon, SpeakerWaveIcon } from "@heroicons/react/24/outline";
import { Hush, Speak } from "../../../_components/common/CodeMusai/TemporalLobe/AuditoryCortex"
import { ViewNews } from "../../../_components/common/news/ViewNews";

interface NewsData {
    title?: string;
    headline?: string;
    byline?: string;
    createdAt?: string;
    updatedAt?: string;
    lead?: string;
    body?: string;
    tail?: string;
}

function readNews(news : any)
{
    var voiceNews = "<p> "
    voiceNews += "Extra Extra, Read all about it: ";
    if (news.headline) voiceNews += news.headline;
    if (news.byline) voiceNews += ". " + news.byline;
    if (news.lead) voiceNews += ". " + news.lead;
    if (news.body) voiceNews += ". " + news.body;
    if (news.tail) voiceNews += ". " + news.tail;
    var div = document.createElement("div");
    div.innerHTML = voiceNews;
    var readableNews = div.textContent || div.innerText || "";

    Speak(readableNews);
}


export function TopNews() 
{
    const router = useRouter();
    const newsService = useNewsService();
    const [theNews, setTheNews] = useState<NewsData | null>(null);
    const [noNews, setNoNews] = useState<boolean>(false);
    
    useEffect(() => {
        console.log('Fetching news...');
        const fetchNews = async () => {
            const newsData = await newsService.getPublic(1);
            console.log('News Data:', newsData[0]); // Check what you receive
            if (newsData && newsData.length > 0) {
                setTheNews(newsData[0]);
            } else {
                setTheNews(null);
                setNoNews(true);
            }
        };
        fetchNews();
    }, []); // Ensure this array is truly empty and not affected by external changes



    return (
        <>
            <br/><br/>
            <div>
                {theNews && 
                    <>
                        <div className="tw-border-opacity-50">
                            
                            <button className="tw-m-2 btn btn-sm btn-primary me-1" onClick={() => {
                                readNews(theNews);
                                }}><div className='tw-flex tw-items-center'>Read <SpeakerWaveIcon className="tw-font-bold tw-pl-1 tw-h-6 tw-w-6" /></div>
                            </button>
                            
                            <button className="tw-m-2 btn btn-sm btn-primary me-1" onClick={() => {
                                Hush();
                                }}><div className='tw-flex tw-items-center'>Hush</div>
                            </button> 

                            <br/><br/>
                            <div className='tw-bg-gray-700 tw-bg-opacity-75 tw-text-white tw-p-4 tw-rounded-lg tw-border tw-border-white tw-border-opacity-50' >
                                
                                <SparklesIcon className="tw-font-bold tw-pl-1 tw-h-6 tw-w-6" />
                                <span className='tw-text-xl'>{theNews.title ?? ""}</span>
                                 
                                <h1 className='tw-text-lg tw-font-bold' dangerouslySetInnerHTML={{ __html: theNews.headline ?? "" }} />
                                {
                                    theNews.byline &&
                                    <h3 className='tw-text-xs tw-italic' dangerouslySetInnerHTML={{ __html: theNews.byline }} />
                                }<br/>
                                <em className='tw-text-sm'>Created: {formatDate(theNews.createdAt)}</em><br/>
                                <em className='tw-text-sm'>Last Updated: {formatDate(theNews.updatedAt)}</em> <br/><br/>
                                <h3 className='tw-text-xl tw-font-bold' dangerouslySetInnerHTML={{ __html: theNews.lead ?? "" }} /><br/>
                                <p className='tw-text-lg' dangerouslySetInnerHTML={{ __html: theNews.body ?? "" }} />
                                <br/>
                                {
                                    theNews.tail &&
                                    <p className='tw-text-sm' dangerouslySetInnerHTML={{ __html: theNews.tail }} />
                                }
                                <SparklesIcon className="tw-font-bold tw-pl-1 tw-h-6 tw-w-6" />
                            </div>
                            
                        </div>
                    </>
                }

               {
                !theNews && !noNews &&
                <div className='tw-border-opacity-50 tw-text-xl' >Loading News...</div>
               }
               
            </div>
        </>
    );
}
