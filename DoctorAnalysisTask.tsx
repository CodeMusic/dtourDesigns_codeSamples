import React, { useState } from 'react'; 
import { useCopilotAware, ActionButton } from "_components/common/CommonComponents";
import { useCopilotAction, CopilotTask, useCopilotContext } from "@copilotkit/react-core";
import { CopilotTextarea } from "@copilotkit/react-textarea";
import { useMakeCopilotReadable } from "@copilotkit/react-core";
import { useAlertService, useUserService, useGenerativeResultService, IGenerativeResult } from '_services'; 
import { SparklesIcon } from "@heroicons/react/24/outline";
import { Hush, Speak } from "_components/common/CodeMusai/TemporalLobe/AuditoryCortex"

const DoctorAnalysisTask: React.FC = () => 
{ 
  const [textareaValue, setTextareaValue] = useState('');
  //const processedValue = useMakeCopilotReadable(textareaValue??"");
  const alertService = useAlertService();
  const userService = useUserService();
  const generativeResultService = useGenerativeResultService();
  const curUser = userService.currentUser;

  function getSystemMessage()
  {
    return "You are a medical doctor and you are analyzing the patient '" + patientName + "', who has the following medical history: '" + history + "', and the following cheif complaint: '" + cheifComplaint + "'. You are expected to provide a physical exam, diagnosis, treatment, doctor notes, and prescription.";
  }

  function setContext(e: any) {
    let value = e?.target?.value ?? "";
    console.log(value);
    setTextareaValue(value); // Update state instead of calling the hook directly
  }

    const [patientName, setPatientName] = useState<string>(''); 
    const [history, setHistory] = useState<string>(''); 
    const [cheifComplaint, setCheifComplaint] = useState<string>(''); 

    const [doctorAnalysisReport, setDoctorAnalysisReport] = useState<DoctorAnalysisModel>(); 
    useCopilotAware("Patient Name: " + patientName);
    useCopilotAware("History: " + history);
    useCopilotAware("Cheif Complaint: " + cheifComplaint);
    useCopilotAware("Doctor Analysis Report: " + doctorAnalysisReport);

    const context = useCopilotContext();
    const runDoctorAnalysisTask = new CopilotTask({
        instructions:
          getSystemMessage(),
          includeCopilotReadable: true
        });
      const [runDoctorAnalysisTaskRunning, setRunDoctorAnalysisTaskRunning] = useState(false);


    const readAnalysis = async (doctorAnalysisReport: DoctorAnalysisModel) => { 

        if (!doctorAnalysisReport) 
        {
            return; 
        }
        var analysisContent = "<p>";
        analysisContent += " Dr. Codmusia Analysis for Patient " + doctorAnalysisReport.PatientName;
        analysisContent += " this patient entered the VR with the following complaint: " + doctorAnalysisReport.CheifComplain;
        analysisContent += " Their medical history is as follows: " + doctorAnalysisReport.History
        analysisContent += " I have performed a physical exam of the patient and the results are as follows: " + doctorAnalysisReport.PhysicalExam;
        analysisContent += " The patient's diagnosis is as follows: " + doctorAnalysisReport.Diagnosis;
        analysisContent += " Here is the treatment that I would recommend: " + doctorAnalysisReport.Treatment;
        analysisContent += " My doctor notes are as follows: " + doctorAnalysisReport.DoctorNotes;
        analysisContent += " I recommend that the patient take the following prescription: " + doctorAnalysisReport.Prescription;
        analysisContent += "</p>";
        var div = document.createElement("div");
        div.innerHTML = analysisContent;
        var readableAnalysis = div.textContent || div.innerText || "";

        Speak(readableAnalysis);
        setContext(readableAnalysis);
        return;
    }; 

    const getHTMLMarkdown = async (doctorAnalysisReport: DoctorAnalysisModel) =>
    {
      var researchContent = "<div className='tw-border tw-border-black tw-text-black tw-text-lg tw-bg-gray-100 tw-shadow tw-mt-2 tw-rounded tw-p-2'>";
      researchContent += `<strong className='tw-text-2xl'>${doctorAnalysisReport.PatientName}</strong> `;
      researchContent += "<br/>";
      researchContent += `<div className='tw-text-sm tw-font-italic'>Cheif Complaint: ${doctorAnalysisReport.CheifComplain}</div>`;
      researchContent += "<br/>";
      researchContent += `<div className='tw-text-sm tw-font-italic'>Medical History: ${doctorAnalysisReport.History}</div>`;
      researchContent += "<br/>";
      researchContent += `<div className='tw-text-base tw-indent-4'>Physical Exam: ${doctorAnalysisReport.PhysicalExam}</div>`;
      researchContent += "<br/>";
      researchContent += `<div className='tw-text-base tw-indent-4'>Diagnosis: ${doctorAnalysisReport.Diagnosis}</div>`;
      researchContent += "<br/>";
      researchContent += `<div className='tw-text-base tw-indent-4'>Treatment: ${doctorAnalysisReport.Treatment}</div>`;
      researchContent += "<br/>";
      researchContent += `<div className='tw-text-sm tw-font-italic'>Doctor Notes: ${doctorAnalysisReport.DoctorNotes}</div>`;
      researchContent += "<br/>";
      researchContent += `<div className='tw-text-base tw-indent-4'>Recommended Prescription: ${doctorAnalysisReport.Prescription}</div>`;
      researchContent += "<br/>";
      researchContent += "</div>";

      return researchContent;
    }

    const saveDoctorAnalysis = async (doctorAnalysisReport: DoctorAnalysisModel) => { 

      var researchData : IGenerativeResult = {
        type: "DoctorAnalysis",
        system_message: getSystemMessage(),
        prompt: `Name: ${doctorAnalysisReport.PatientName}, History: ${doctorAnalysisReport.History}, Cheif Complaint: ${doctorAnalysisReport.CheifComplain}`,
        title: `${doctorAnalysisReport.PatientName} - ${doctorAnalysisReport.CheifComplain}`,
        result: await getHTMLMarkdown(doctorAnalysisReport),
        authorUserId: Number(curUser?.id ?? 1)
      };

      await generativeResultService.create(researchData);
      alertService.success('Research saved', true);
    } 

useCopilotAction({
    name: "populateDoctorAnalysis",
    description:
      "Populate the doctorAnalysisReport state variable with the result of the doctor analysis.",
    parameters: [
      {
        name: "PatientName",
        type: "string",
        description: "This is the patient's name, which was provided on the form as the variable patientName, rephrase it to be talking about the patient.",
      },
      {
        name: "History",
        type: "string",
        description: "This is the patient's medical history, which was provided on the form as the variable history, rephrase it to be talking about the patient.",
      },
      {
        name: "CheifComplain",
        type: "string",
        description: "This is the patient's cheif complaint, which was provided on the form as the variable cheifComplaint.",
      },     
      {
        name: "PhysicalExam",
        type: "string",
        description:
          "This represents the physical exam that you have performed on the patient.",
      },
      {
        name: "Diagnosis",
        type: "string",
        description:
          "This represents the diagnosis that you have given to the patient.",
      },
      {
        name: "Treatment",
        type: "string",
        description:
          "This represents the treatment that you would recommend to the patient.",
      },
      {
        name: "DoctorNotes",
        type: "string",
        description:
          "This represents your personal notes that you made during your visit with the patient.",
      },
            {
        name: "Prescription",
        type: "string",
        description:
          "This represents the prescription that you would recommend to the patient.",
      },
    ],
    handler: async ({ PatientName, CheifComplain, History, PhysicalExam, Diagnosis, Treatment, DoctorNotes, Prescription }) => {
      const newDoctorAnalysis: DoctorAnalysisModel = {
        PatientName: String(PatientName),
        History: String(History),
        CheifComplain: String(CheifComplain),
        PhysicalExam: String(PhysicalExam),
        Diagnosis: String(Diagnosis),
        Treatment: String(Treatment),
        DoctorNotes: String(DoctorNotes),
        Prescription: String(Prescription),
      };
      readAnalysis(newDoctorAnalysis);
      setDoctorAnalysisReport(newDoctorAnalysis);
      saveDoctorAnalysis(newDoctorAnalysis);
    },
    render: "Running AI Automated Research...",
  });



    return (
                <>
                    <div>
                    {
                        doctorAnalysisReport && 
                        <div className='tw-border tw-border-black tw-text-black tw-text-lg tw-bg-gray-100 tw-shadow tw-mt-2 tw-rounded tw-p-2'>
                            <strong className='tw-text-2xl'>{doctorAnalysisReport.PatientName}</strong> 
                            <br/>
                            <div className='tw-text-sm tw-font-italic'>Cheif Complaint: {doctorAnalysisReport.CheifComplain}</div>
                            <br/>
                            <div className='tw-text-sm tw-font-italic'>Medical History: {doctorAnalysisReport.History}</div>
                            <br/>
                            <div className='tw-text-base tw-indent-4'>Physical Exam: {doctorAnalysisReport.PhysicalExam}</div>
                            <br/>
                            <div className='tw-text-base tw-indent-4'>Diagnosis: {doctorAnalysisReport.Diagnosis}</div>
                            <br/>
                            <div className='tw-text-base tw-indent-4'>Treatment: {doctorAnalysisReport.Treatment}</div>
                            <br/>
                            <div className='tw-text-sm tw-font-italic'>Doctor Notes: {doctorAnalysisReport.DoctorNotes}</div>
                            <br/>
                            <div className='tw-text-base tw-indent-4'>Recommended Prescription: {doctorAnalysisReport.Prescription}</div>
                            <br/>
                        </div>
                    } 
                    </div>
                    <div className='tw-p-4 tw-border tw-border-black tw-text-black tw-bg-gray-200 tw-shadow tw-mt-2 tw-rounded'> 
                      <div className='tw-text-lg tw-text-black tw-font-bold tw-mt-2 tw-underline'>Patient Name:</div>
                      <input className='tw-border tw-border-black tw-text-white tw-text-lg tw-bg-gray-700 tw-shadow tw-mt-2 tw-rounded' type="text" 
                            value={patientName} 
                            onChange={(e) => setPatientName(e?.target?.value ?? "")} 
                            placeholder="John Smith" /> 
                            <br/><br/>
                      <div className='tw-text-lg tw-text-black tw-font-bold tw-mt-2 tw-underline'>Medical History:</div>
                      <CopilotTextarea className='tw-border tw-border-black tw-text-black tw-text-lg tw-bg-gray-700 tw-shadow tw-mt-2 tw-rounded' 
                            value={history} 
                            onChange={(e) => setHistory(e?.target?.value ?? "")} 
                            placeholder="Enter your medical history..." 
                            autosuggestionsConfig={{
                              textareaPurpose:
                                  "The doctor is analyzing the patient, in this case the doctor is predicting their medical history.",
                              debounceTime: 250,
                              disableWhenEmpty: true,
                      
                              // Accept on tab is the default behavior, but we can override it if we wanted to, as so:
                              shouldAcceptAutosuggestionOnKeyPress: (event: React.KeyboardEvent<HTMLDivElement>) => {
                                  // if tab, accept the autosuggestion
                                  if (event.key === "Tab") 
                                  {
                                    return true;
                                  }
                                  return false;
                              },
                      
                              chatApiConfigs: {
                                  suggestionsApiConfig: {
                                      //model: 'gpt-4-0125-preview',
                                  forwardedParams: {
                                      max_tokens: 20,
                                      stop: [".", "?", "!"],
                                  },
                                  },
                                  insertionApiConfig: {},
                              },
                            }}  
                            /> 
                            <br/>
                        <div className='tw-text-lg tw-text-black tw-font-bold tw-mt-2 tw-underline'>Cheif Complaint:</div>       
                        <CopilotTextarea className='tw-border tw-border-black tw-text-black tw-text-lg tw-bg-gray-7000 tw-shadow tw-mt-2 tw-rounded' 
                            value={cheifComplaint} 
                            onChange={(e) => setCheifComplaint(e?.target?.value ?? "")} 
                            placeholder="Enter cheif complaint..."
                            autosuggestionsConfig={{
                              textareaPurpose:
                                  "A doctor is analyzing the patient, in this case the doctor is predicting their cheif complaint.",
                              debounceTime: 250,
                              disableWhenEmpty: true,
                      
                              // Accept on tab is the default behavior, but we can override it if we wanted to, as so:
                              shouldAcceptAutosuggestionOnKeyPress: (event: React.KeyboardEvent<HTMLDivElement>) => {
                                  // if tab, accept the autosuggestion
                                  if (event.key === "Tab") 
                                  {
                                    return true;
                                  }
                                  return false;
                              },
                      
                              chatApiConfigs: {
                                  suggestionsApiConfig: {
                                      //model: 'gpt-4-0125-preview',
                                  forwardedParams: {
                                      max_tokens: 20,
                                      stop: [".", "?", "!"],
                                  },
                                  },
                                  insertionApiConfig: {},
                              },
                              }}  
                        /> 
                        <br/>
                        <ActionButton 
                        className='rounded-l-none ml-[1px] btn btn-primary tw-border hover:tw-bg-gray-800 tw-border-black tw-text-white tw-bg-black tw-shadow tw-mt-2' 
                        disabled={runDoctorAnalysisTaskRunning}
                        onClick={runDoctorAnalysis}
                        >
                            <div className='tw-flex tw-items-center'>Perform Doctor Analysis <SparklesIcon className="tw-font-bold tw-pl-1 tw-h-6 tw-w-6" /></div>
                        </ActionButton> 

         
                  </div> 
                </>
            ); 

            async function runDoctorAnalysis()
            {
              setRunDoctorAnalysisTaskRunning(true);
              useCopilotAware("Doctor Analysis: " + patientName);
              Speak("Starting Doctor Analysis for patient, " + patientName);
              await runDoctorAnalysisTask.run(context);
              setRunDoctorAnalysisTaskRunning(false);
            }
}; 

export default DoctorAnalysisTask;

export interface DoctorAnalysisModel {
    PatientName: string;
    History: string;
    CheifComplain: string;
    PhysicalExam: string;
    Diagnosis: string;
    Treatment: string;
    DoctorNotes: string;
    Prescription: string;
  }

