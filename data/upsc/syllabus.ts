import type { UPSCSyllabus } from "@/types/Syllabus";

export const upscSyllabus: UPSCSyllabus = {
  id: "upsc-cse-2028",
  exam: "UPSC CSE",
  targetYear: 2028,

  sections: [
    {
      id: "prelims",
      name: "Prelims",
      stage: "prelims",

      subjects: [
        {
          id: "prelims-gs",
          name: "General Studies Paper I",
          paper: "prelims-gs",

          topics: [
            {
              id: "prelims-history",
              name: "History",
              children: [],
            },
            {
              id: "prelims-geography",
              name: "Geography",
              children: [],
            },
            {
              id: "prelims-polity",
              name: "Indian Polity",
              children: [],
            },
            {
              id: "prelims-economy",
              name: "Indian Economy",
              children: [],
            },
            {
              id: "prelims-environment",
              name: "Environment & Ecology",
              children: [],
            },
            {
              id: "prelims-science-tech",
              name: "Science & Technology",
              children: [],
            },
            {
              id: "prelims-current-affairs",
              name: "Current Affairs",
              children: [],
            },
          ],
        },

        {
          id: "csat",
          name: "CSAT",
          paper: "csat",

          topics: [
            {
              id: "csat-comprehension",
              name: "Comprehension",
              children: [],
            },
            {
              id: "csat-quant",
              name: "Basic Numeracy & Quantitative Aptitude",
              children: [],
            },
            {
              id: "csat-reasoning",
              name: "Logical & Analytical Reasoning",
              children: [],
            },
          ],
        },
      ],
    },

    {
      id: "mains",
      name: "Mains",
      stage: "mains",

      subjects: [
        {
          id: "essay",
          name: "Essay",
          paper: "essay",
          topics: [],
        },
        {
          id: "gs1",
          name: "General Studies I",
          paper: "gs1",
          topics: [],
        },
        {
          id: "gs2",
          name: "General Studies II",
          paper: "gs2",
          topics: [],
        },
        {
          id: "gs3",
          name: "General Studies III",
          paper: "gs3",
          topics: [],
        },
        {
          id: "gs4",
          name: "General Studies IV",
          paper: "gs4",
          topics: [],
        },
        {
          id: "optional",
          name: "Optional",
          paper: "optional",
          topics: [],
        },
      ],
    },
  ],
};