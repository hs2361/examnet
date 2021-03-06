/// <reference types="svelte" />
interface Exam {
    ID: string;
    Examiner: string;
    Title: string;
    Subject: string;
    Live: boolean;
    Date: string;
    Duration: number;
    Password: string;
    Address: string;
    ExaminerKey: string;
}

interface Result {
    Type?: "Result";
    ID: string;
    AnswerSheetID: string;
    ExamID: string;
    Examiner: string;
    RollNumber: string;
    Address: string;
    Signature: string;
}