import { upscSyllabus } from "@/data/upsc/syllabus";
import type {
  SyllabusSection,
  SyllabusSubject,
  SyllabusTopic,
} from "@/types/Syllabus";

export const syllabusService = {
  getSyllabus() {
    return upscSyllabus;
  },

  getSection(sectionId: string): SyllabusSection | undefined {
    return upscSyllabus.sections.find(
      (section) => section.id === sectionId
    );
  },

  getSubject(subjectId: string): SyllabusSubject | undefined {
    for (const section of upscSyllabus.sections) {
      const subject = section.subjects.find(
        (item) => item.id === subjectId
      );

      if (subject) {
        return subject;
      }
    }

    return undefined;
  },

  getTopic(topicId: string): SyllabusTopic | undefined {
    const searchTopics = (
      topics: SyllabusTopic[]
    ): SyllabusTopic | undefined => {
      for (const topic of topics) {
        if (topic.id === topicId) {
          return topic;
        }

        if (topic.children) {
          const result = searchTopics(topic.children);

          if (result) {
            return result;
          }
        }
      }

      return undefined;
    };

    for (const section of upscSyllabus.sections) {
      for (const subject of section.subjects) {
        const result = searchTopics(subject.topics);

        if (result) {
          return result;
        }
      }
    }

    return undefined;
  },
};