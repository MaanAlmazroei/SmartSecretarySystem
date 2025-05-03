import React, { useState, useEffect } from "react";
import "./NoSecResources.css";
import { getAllResources } from "../../../services/ApiService";

const NoSecResources = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSection, setActiveSection] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await getAllResources();
        if (response.error) {
          throw new Error(response.error);
        }
        setResources(response);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const toggleCategory = (index) => {
    setActiveCategory(activeCategory === index ? null : index);
  };

  const toggleSection = (catIndex, secIndex) => {
    setActiveSection((prev) => ({
      ...prev,
      [catIndex]: prev[catIndex] === secIndex ? null : secIndex,
    }));
  };

  const handleDownload = (fileUrl, fileName) => {
    // Create a temporary link element
    const link = document.createElement("a");
    link.href = fileUrl;
    link.style.display = "none"; // Hide the link
    document.body.appendChild(link);

    // Trigger the download
    link.click();

    // Clean up
    document.body.removeChild(link);
  };

  // Group resources by type
  const categories = resources.reduce((acc, resource) => {
    const existingCategory = acc.find((cat) => cat.title === resource.type);
    if (existingCategory) {
      existingCategory.sections.push({
        title: resource.title,
        content: resource.description,
        id: resource.id,
        createdAt: resource.createdAt,
        lastUpdatedDate: resource.lastUpdatedDate,
        fileUrl: resource.fileUrl,
        fileName: resource.fileName,
      });
    } else {
      acc.push({
        title: resource.type,
        sections: [
          {
            title: resource.title,
            content: resource.description,
            id: resource.id,
            createdAt: resource.createdAt,
            lastUpdatedDate: resource.lastUpdatedDate,
            fileUrl: resource.fileUrl,
            fileName: resource.fileName,
          },
        ],
      });
    }
    return acc;
  }, []);

  if (loading) {
    return (
      <div className="nosec-resources-container">
        <div className="nosec-resources-header">
          <h1 className="nosec-resources-heading">Resources</h1>
        </div>
        <div className="nosec-resources-loading">Loading resources...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nosec-resources-container">
        <div className="nosec-resources-header">
          <h1 className="nosec-resources-heading">Resources</h1>
        </div>
        <div className="nosec-resources-error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="nosec-resources-container">
      <div className="nosec-resources-header">
        <h1 className="nosec-resources-heading">Resources</h1>
      </div>

      <div className="nosec-resources-searchWrapper">
        <input
          type="text"
          placeholder="Search for a topic..."
          className="nosec-resources-searchInput"
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
          <div className="nosec-resources-category" key={catIndex}>
            <div
              className="nosec-resources-categoryHeader"
              onClick={() => toggleCategory(catIndex)}
            >
              <span className="nosec-resources-categoryTitle">
                {category.title}
              </span>
              <span className="nosec-resources-icon">
                {activeCategory === catIndex ? "−" : "+"}
              </span>
            </div>

            {activeCategory === catIndex && (
              <div className="nosec-resources-sectionList">
                {filteredSections.map((section, secIndex) => {
                  const isOpen = activeSection[catIndex] === secIndex;
                  return (
                    <div className="nosec-resources-section" key={section.id}>
                      <div
                        className="nosec-resources-sectionHeader"
                        onClick={() => toggleSection(catIndex, secIndex)}
                      >
                        <span className="nosec-resources-sectionTitle">
                          {section.title}
                        </span>
                        <div className="nosec-resources-sectionActions">
                          {section.fileUrl && (
                            <button
                              className="nosec-resources-downloadBtn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(section.fileUrl);
                              }}
                            >
                              Download
                            </button>
                          )}
                          <span className="nosec-resources-icon">
                            {isOpen ? "−" : "+"}
                          </span>
                        </div>
                      </div>
                      {isOpen && (
                        <div className="nosec-resources-content">
                          <p className="nosec-resources-paragraph">
                            {section.content}
                          </p>
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

export default NoSecResources;
