import { Request, Response, NextFunction } from 'express';
import { AIService } from '../services/ai.service';
import { coverLetterOutputSchema, resumeBulletsOutputSchema, studyPlanOutputSchema } from '../validations/ai.validation';

export const generateCoverLetter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jobDescription, userProfile, company, role } = req.body;

    const coverLetterText = await AIService.generateCoverLetter({
      jobDescription,
      userProfile,
      company,
      role,
    });

    const validatedOutput = coverLetterOutputSchema.parse({ coverLetter: coverLetterText });

    res.status(200).json({
      success: true,
      data: validatedOutput,
    });
  } catch (error) {
    next(error);
  }
};

export const generateResumeBullets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jobDescription, rawExperience, company, role } = req.body;

    const bulletsArray = await AIService.generateResumeBullets({
      jobDescription,
      rawExperience,
      company,
      role,
    });

    const validatedOutput = resumeBulletsOutputSchema.parse({ bullets: bulletsArray });

    res.status(200).json({
      success: true,
      data: validatedOutput,
    });
  } catch (error) {
    next(error);
  }
};

export const generateStudyPlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { topicName, skillLevel } = req.body;

    const subTopics = await AIService.generateStudyPlan({
      topicName,
      skillLevel,
    });

    const validatedOutput = studyPlanOutputSchema.parse({ subTopics });

    res.status(200).json({
      success: true,
      data: validatedOutput,
    });
  } catch (error) {
    next(error);
  }
};
