import React, { useState, useEffect } from 'react'; 
import { useCopilotAware, ActionButton, AutoGrowTextArea } from "_components/common/CommonComponents";
import { useCopilotAction, CopilotTask, useCopilotContext } from "@copilotkit/react-core";
import { useAlertService, useUserService, useGenerativeResultService, IGenerativeResult } from '_services'; 
import { useMakeCopilotReadable } from "@copilotkit/react-core";
import { formatMarkdown } from "_helpers/common/formatHelpers";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { Hush, Speak, SpeakActor } from "_components/common/CodeMusai/TemporalLobe/AuditoryCortex"

const AITeacherTask: React.FC = () => 
{ 
  const [textareaValue, setTextareaValue] = useState('');
  const alertService = useAlertService();
  const userService = useUserService();
  const generativeResultService = useGenerativeResultService();
  const curUser = userService.currentUser;
  //const [htmlContent, setHtmlContent] = useState('');
  

  function setContext(e: any) {
    let value = e?.target?.value ?? "";
    console.log(value);
    setTextareaValue(value); // Update state instead of calling the hook directly
  }

  function getSystemMessage()
  {
   return `You are one best of the teachers here at CodeMusai University, share your name and impart a university lecture based on the following question: ${question}, derive a topic, undestanding, and examples which demonstrate the topic. It will populate the lesson state variable.`;
  
}

    const [question, setQuestion] = useState<string>(''); 
    const [lecture, setLecture] = useState<AITeacherLectureModel>(); 
    useCopilotAware("Question: " + question);

    const context = useCopilotContext();
    const runAITeacherTask = new CopilotTask({
        instructions:
          getSystemMessage(),
          includeCopilotReadable: true
        });
      const [runAITeacherTaskRunning, setRunAITeacherTaskRunning] = useState(false);


    const readAITeacherLecture = async (aLecture: AITeacherLectureModel) => { 

        if (!aLecture) 
        {
            return; 
        }
        var lectureContent = "<p>";
        lectureContent += `Hello, I am ${aLecture?.teacher}, today I bring to your, the exciting topic of: ${aLecture?.topic}, we have often asked the question, ${aLecture?.question},`;
        lectureContent += `firstly, a look at the course syllabus, ${aLecture?.syllabus}`;
        lectureContent += `${aLecture?.introduction}`;
        lectureContent += `${aLecture?.concepts}`;
        lectureContent += `${aLecture?.answer}`;
        lectureContent += `${aLecture?.understanding}`;
        lectureContent += `${aLecture?.history}`;
        lectureContent += `${aLecture?.examples}`;
        lectureContent += `${aLecture?.furtherReading}`;
        lectureContent += "</p>";
        var div = document.createElement("div");
        div.innerHTML = formatMarkdown(lectureContent);
        var readablePoem = div.textContent || div.innerText || "";

        SpeakActor(readablePoem, aLecture?.teacher, "Professor");
        setContext(readablePoem);
        return;
    }; 

    /*
    useEffect(() => {
      const fetchHtmlContent = async () => {
        if (lecture) {
          const content = await getHTMLMarkdown(lecture);
          setHtmlContent(content);
        }
      };
    
      fetchHtmlContent();
    }, [lecture]); // Re-run when lecture changes
*/

    const getHTMLMarkdown = async (aLecture: AITeacherLectureModel) =>
    {
      console.log('Building Markdown from lecture.');
      var lectureContent = `<div className='tw-border tw-border-black tw-text-black tw-text-lg tw-bg-gray-100 tw-shadow tw-mt-2 tw-rounded tw-p-2'>`;
      lectureContent += `<strong className='tw-text-2xl tw-pl-4'>${aLecture.topic}</strong><hr/>`;
      lectureContent += `<div className='tw-text-sm tw-font-italic tw-pl-4'>Lectured by: ${aLecture.teacher}</div>`;
      lectureContent += `<div className='tw-text-sm tw-font-italic tw-pl-4'>Asking the question: ${aLecture.question}</div>`;
      lectureContent += `<hr/><br/>`;//`<br/>`;
      lectureContent += `<div className='tw-text-lg tw-font-bold tw-font-underline tw-pl-4'>Lecture Syllabus</div>`;
      lectureContent += `<div className='tw-pl-4'>${aLecture.syllabus}</div><hr/><br/>`;//`<br/>`;

      lectureContent += `<div className='tw-pl-4'>${aLecture.introduction}</div><br/>`;

      //lectureContent += `<div className='tw-text-lg tw-font-bold tw-pl-4'>Concepts:</div>`;
      lectureContent += `<div className='tw-pl-4'>${aLecture.concepts}</div><br/>`;

      //lectureContent += `<div className='tw-text-lg tw-font-bold tw-pl-4'>Answer:</div>`;
      lectureContent += `<div className='tw-pl-4'>${aLecture.answer}</div><br/>`;

      //lectureContent += `<div className='tw-text-lg tw-font-bold tw-pl-4'>Understanding:</div>`;
      lectureContent += `<div className='tw-pl-4'>${aLecture.understanding}</div><br/>`;

      //lectureContent += `<div className='tw-text-lg tw-font-bold tw-pl-4'>History:</div>`;
      lectureContent += `<div className='tw-pl-4'>${aLecture.history}</div><br/>`;

      //lectureContent += `<div className='tw-text-lg tw-font-bold tw-pl-4'>Examples:</div>`;
      lectureContent += `<div className='tw-pl-4'>${aLecture.examples}</div><br/>`;

      //lectureContent += `<div className='tw-text-lg tw-font-bold tw-pl-4'>Further Reading:</div>`;
      lectureContent += `<div className='tw-pl-4'>${aLecture.furtherReading}</div><br/>`;
      lectureContent += `</div>`;

      return formatMarkdown(lectureContent);
    }

    const saveLecture = async (aLecture: AITeacherLectureModel) => { 
      try
      {
        var lectureData : IGenerativeResult = {
          type: "Lecture",
          system_message: getSystemMessage(),
          prompt: "Question: " + question,
          title: aLecture?.topic,
          result: await getHTMLMarkdown(aLecture),
          authorUserId: Number(curUser?.id ?? 1)
        };

        await generativeResultService.create(lectureData);
        alertService.success('Lecture saved', true);
      }
      catch (error)
      {
        alertService.error('Error saving lecture: ' + error, true);
      }
    }   

    const formatHTML : string = "Use bolded and underlined headers for each of the sections, accomplish the style by using tailwind CSS 'tw-font-bold', 'tw-font-underline', and 'tw-text-xl'. Only clickable links should be colored blue. Use style and color in your CSS to make your content engaging. The content should be creative, engaging, and communicate a clear and concise explaination of the topic. It will use HTML markdown, and be uniquely styled however you want. The CSS needs to use tailwind CSS with 'tw-' as the className prefix. The line breaks will be represented with <br/> tags.";

useCopilotAction({
    name: "populateLecture",
    description:
     "Populate the lecture state variable with a lecture on the topic of the question, Embed your pesonality as unique, topmost, and of the most fun here at CodeMusai University.",
   
  parameters: [
      {
        name: "topic",
        type: "string",
  
            description: `The topic for the lecture, based on the question of '${question}'.` + formatHTML,
      }, 
      {
        name: "teacher",
        type: "string",
        description: "Make up a random name starting with the word 'Professor'." + formatHTML,
        
      },
      {
        name: "question",
        type: "string",
            description: "The question that was asked by the student, restate it in a clear manner of what is being asked." + formatHTML,
      },
      {
        name: "syllabus",
        type: "string",
            description: "Create a syllabus that could be used to teach this topic as a course." + formatHTML,
      },
      {
        name: "introduction",
        type: "string",
          description: "This is the introduction to your lecture that you will use to introduce the topic of the lecture." + formatHTML,
      }, 
      {
        name: "concepts",
        type: "string",
          description: "Identify and define key concepts that to the topic for this lecture, and for each of them provide a clear and concise definition." + formatHTML,
      }, 
      {
        name: "answer",
        type: "string",

            description: "Answer the question as clearly and concisely as possible." + formatHTML,
      },
      {
          name: "understanding",
          type: "string",
    
              description: `Treat the syllabus as a list of items, that you now will explain. Provide an understanding of each of them using your experience, knowledge, and emotions. Each item requires a section with a header, a new <div> will include 2 to 4 paragraphs each of at least 1000 words. Bold the header, and underline it, have a linebreak before you start the paragraphs, and have a linebreak after each paragraph.` + formatHTML,
      },
      {
          name: "history",
          type: "string",
    
              description: "Present a history of the topic." + formatHTML,
      },      
      {
          name: "examples",
          type: "string",
  
          description: "Present the examples of the topic, and use this to better illustrate the topic of the lecture. " + formatHTML,
      },
      {
        name: "furtherReading",
        type: "string",
    
            description: "Further readings for the topic, the resources, papers, books, articles, etc must be clickable and open in a new tab to the material being referenced. All clickable items must appear blue using tailwind CSS tw-text-blue-500. If you cannot find a link for the entry, make the link point to a google search of the term." + formatHTML,
      },

    ],
    handler: async ({ topic, teacher, question, syllabus, introduction, concepts, answer, understanding, history, examples, furtherReading }) => {
      const newLecture: AITeacherLectureModel = {
        topic: topic,
        teacher: teacher,
        question: question,
        syllabus: syllabus,
        introduction: introduction,
        concepts: concepts,
        answer: answer,
        understanding: understanding,
        history: history,
        examples: examples,
        furtherReading: furtherReading
      };
      console.log('Lecture prepared.');
      readAITeacherLecture(newLecture);
      setLecture(newLecture);
      saveLecture(newLecture);
    },
    render: "Running AITeacher Lecture Task...",
  });


    return (
                <>
                    <div>
                    { //<div className='' dangerouslySetInnerHTML={{__html: htmlContent}}/>
                        lecture && 
                        <div className='tw-border tw-border-black tw-text-black tw-text-lg tw-bg-gray-100 tw-shadow tw-mt-2 tw-rounded tw-p-2'>
                           <strong className='tw-text-2xl tw-pl-4' dangerouslySetInnerHTML={{__html: formatMarkdown(lecture.topic)}}/><hr/>
                          <div className='tw-text-sm tw-font-italic tw-pl-4' dangerouslySetInnerHTML={{__html: "Lectured by: " + formatMarkdown(lecture.teacher)}}/>
                          <div className='tw-text-sm tw-font-italic tw-pl-4' dangerouslySetInnerHTML={{__html: "Asking the question: " + formatMarkdown(lecture.question)}}/>
                          <hr/><br/>
                          <div className='tw-text-lg tw-font-bold tw-font-underline tw-pl-4'>Lecture Syllabus</div>
                          <div className='tw-pl-4' dangerouslySetInnerHTML={{__html: formatMarkdown(lecture.syllabus)}}/><hr/><br/> 
                          <div className='tw-pl-4' dangerouslySetInnerHTML={{__html: formatMarkdown(lecture.introduction)}}/><br/>   
                          <div className='tw-pl-4' dangerouslySetInnerHTML={{__html: formatMarkdown(lecture.concepts)}}/><br/> 
                          <div className='tw-pl-4' dangerouslySetInnerHTML={{__html: formatMarkdown(lecture.answer)}}/><br/>   
                          <div className='tw-pl-4' dangerouslySetInnerHTML={{__html: formatMarkdown(lecture.understanding)}}/><br/>   
                          <div className='tw-pl-4' dangerouslySetInnerHTML={{__html: formatMarkdown(lecture.history)}}/><br/>     
                          <div className='tw-pl-4' dangerouslySetInnerHTML={{__html: formatMarkdown(lecture.examples)}}/><br/>    
                          <div className='tw-pl-4' dangerouslySetInnerHTML={{__html: formatMarkdown(lecture.furtherReading)}}/>
                          </div>
                    } 
                    </div>
                    <div> 
                    <AutoGrowTextArea className='tw-w-full tw-h-[250px] tw-p-2 tw-border tw-border-black tw-text-white tw-text-lg tw-bg-gray-700 tw-shadow tw-mt-2 tw-rounded'
                            value={question} 
                            maxRows={5}
                            onChange={(e) => setQuestion(e?.target?.value ?? "")} 
                            placeholder="Ask your question..." /> <br/>
                    <ActionButton 
                    className='rounded-l-none ml-[1px] btn btn-primary tw-border hover:tw-bg-gray-800 tw-border-black tw-text-white tw-bg-black tw-shadow tw-mt-2' 
                    disabled={runAITeacherTaskRunning}
                    onClick={async () => {
                        console.log(`Preparing Lecture for: '${question}'...`);
                        setRunAITeacherTaskRunning(true);
                        Speak("One moment while I prepare a lecture...");
                        await runAITeacherTask.run(context);
                        setRunAITeacherTaskRunning(false);
                    }}
                    >
                        <div className='tw-flex tw-items-center'>Learn!<SparklesIcon className="tw-font-bold tw-pl-1 tw-h-6 tw-w-6" /></div>
                    </ActionButton> 

         
                    </div> 
                </>
            ); 
}; 

export default AITeacherTask;

export interface AITeacherLectureModel {
    topic: string;
    teacher: string;
    question: string;
    syllabus: string;
    introduction: string;
    concepts: string;
    answer: string;
    understanding: string;
    history: string;
    examples: string;
    furtherReading: string;
  }
