import React, { useState } from "react";
import "./Portal.css";

const Portal = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSection, setActiveSection] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const toggleCategory = (index) => {
    setActiveCategory(activeCategory === index ? null : index);
  };

  const toggleSection = (catIndex, secIndex) => {
    setActiveSection((prev) => ({
      ...prev,
      [catIndex]: prev[catIndex] === secIndex ? null : secIndex,
    }));
  };

  const categories = [
    {
      title: "Course Addition and Deletion",
      sections: [
        {
          title: "Course Deletion",
          content:
            "To delete a course, log in to your ODUS Plus account. Navigate to the Student Services section, then select Course Management. Find the course you want to delete and click 'Drop'. Ensure you confirm the action and double-check the deadline for course changes.",
        },
        {
          title: "Course Addition",
          content:
            "To add a course, access ODUS Plus and go to the Student Services menu. Click on Course Registration and search for the desired course. Add it to your schedule and ensure there are no time conflicts. Submit your registration and confirm the course has been added.",
        },
      ],
    },
    {
      title: "Exam Absence Procedures",
      sections: [
        {
          title: "Submit an Excuse",
          content:
            "If you miss an exam, you must submit an official excuse through the university portal. Go to the Exam Services section, select 'Submit Absence', and upload any required documentation.",
        },
      ],
    },
  ];

  return (
    <div className="portal-container">
      <h1 className="portal-heading">Self Service Portal</h1>

      <div className="portal-searchWrapper">
        <input
          type="text"
          placeholder="Search for a topic..."
          className="portal-searchInput"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {categories.map((category, catIndex) => {
        const filteredSections = category.sections.filter(
          (section) =>
            section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            section.content.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filteredSections.length === 0) return null;

        return (
          <div className="portal-category" key={catIndex}>
            <div
              className="portal-categoryHeader"
              onClick={() => toggleCategory(catIndex)}
            >
              <span className="portal-categoryTitle">{category.title}</span>
              <span className="portal-icon">
                {activeCategory === catIndex ? "−" : "+"}
              </span>
            </div>

            {activeCategory === catIndex && (
              <div className="portal-sectionList">
                {filteredSections.map((section, secIndex) => {
                  const isOpen = activeSection[catIndex] === secIndex;
                  return (
                    <div className="portal-section" key={secIndex}>
                      <div
                        className="portal-sectionHeader"
                        onClick={() => toggleSection(catIndex, secIndex)}
                      >
                        <span className="portal-sectionTitle">
                          {section.title}
                        </span>
                        <span className="portal-icon">
                          {isOpen ? "−" : "+"}
                        </span>
                      </div>
                      {isOpen && (
                        <div className="portal-content">
                          <p className="portal-paragraph">{section.content}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Portal;
