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
            "To delete a course, log in to your ODUS Plus account. Navigate to the Student Services section, then select Course Management. Find the course you want to delete and click 'Drop'. Ensure you confirm the action and double-check the deadline for course changes."
        },
        {
          title: "Course Addition",
          content:
            "To add a course, access ODUS Plus and go to the Student Services menu. Click on Course Registration and search for the desired course. Add it to your schedule and ensure there are no time conflicts. Submit your registration and confirm the course has been added."
        }
      ]
    },
    {
      title: "Exam Absence Procedures",
      sections: [
        {
          title: "Submit an Excuse",
          content:
            "If you miss an exam, you must submit an official excuse through the university portal. Go to the Exam Services section, select 'Submit Absence', and upload any required documentation."
        }
      ]
    }
  ];

  return (
    <div className="Portal-container">
      <h1 className="Portal-heading">Self Service Portal</h1>

      <div className="Portal-searchWrapper">
        <input
          type="text"
          placeholder="Search for a topic..."
          className="Portal-searchInput"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {categories.map((category, catIndex) => {
        const filteredSections = category.sections.filter((section) =>
          section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          section.content.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filteredSections.length === 0) return null;

        return (
          <div className="Portal-category" key={catIndex}>
            <div
              className="Portal-categoryHeader"
              onClick={() => toggleCategory(catIndex)}
            >
              <span className="Portal-categoryTitle">{category.title}</span>
              <span className="Portal-icon">
                {activeCategory === catIndex ? "−" : "+"}
              </span>
            </div>

            {activeCategory === catIndex && (
              <div className="Portal-sectionList">
                {filteredSections.map((section, secIndex) => {
                  const isOpen = activeSection[catIndex] === secIndex;
                  return (
                    <div className="Portal-section" key={secIndex}>
                      <div
                        className="Portal-sectionHeader"
                        onClick={() => toggleSection(catIndex, secIndex)}
                      >
                        <span className="Portal-sectionTitle">{section.title}</span>
                        <span className="Portal-icon">{isOpen ? "−" : "+"}</span>
                      </div>
                      {isOpen && (
                        <div className="Portal-content">
                          <p className="Portal-paragraph">{section.content}</p>
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