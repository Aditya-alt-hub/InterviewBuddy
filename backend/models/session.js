import mongoose from "mongoose";

const questionSchema=new mongoose.Schema(
    {
        questionText:
        {
            type:String,
            required:true,
        },
        questionType:
        {
            type:String,
            enum:["coding","Technical","HR"],
            required:true,
        },
        questionDifficulty:
        {
            type:String,
            enum:["easy","medium","hard"],
            required:true,
        },
        idealAnswer:
        {
            type:String,
            default:"pending",
        },
        userAnswer:
        {
            type:String,
            default:"",
        },
        userSubmittedCode:
        {
            type:String,
            default:"",
        },
        answerisSubmitted:
        {
            type:Boolean,
            default:false,
        },
        answerisEvaluated:
        {
            type:Boolean,
            default:false,  
        },
        technicalScore:
        {
            type:Number,
            min:0,
            max:100,
            default:0,
        },
        confidenceScore:
        {
            type:Number,
            min:0,  
            max:100,
            default:0,
        },
        AIFeedback:
        {
            type:String,
            default:"Not Yet submitted or evaluated",
        },

    }
);

const sessionSchema=new mongoose.Schema(
    {
        user:
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
            index:true,
        },
        role:
        {
            type:String,
            required:true,
        },
        level:
        {
            type:String,
            required:true,
        },
        interviewType:
        {
            type:String,
            enum:["coding","Technical","HR"],
            required:true,
        },
        status:
        {
            type:String,
            enum:["pending","in-progress","completed","failed"],
            default:"pending",
        },
    //     interviewScore:
    //     {
    //         type:Number,
    //             min:0,
    //             max:100,
    //             default:0,
    //     },
    //     TechnicalScore:
    //     {
    //         type:Number,
    //             min:0,
    //             max:100,
    //             default:0,
    //     },
    //     confidenceScore:
    //     {
    //         type:Number,
    //             min:0,
    //             max:100,
    //             default:0,
    //     },
    //     questions:[questionSchema],

    //     startTime:
    //     {
    //         type:Date,
    //         default:Date.now,
    //     },
    //     endTime:
    //     {
    //         type:Date,
    //         default:Date.now,
    //     },

    // },
    // {
    //     timestamps:true,

    // },

    overallScore: {
        type: Number,
        default: 0,
    },
    metrics: {
        avgTechnical: { type: Number, default: 0 },
        avgConfidence: { type: Number, default: 0 },
    },
    questions:[questionSchema],
    startTime:{type:Date,default:Date.now},
    endTime:{type:Date},
   
},{
    timestamps:true
}
);

const Session=mongoose.model("Session",sessionSchema);
export default Session;