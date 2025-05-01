import React, { useState, useEffect } from "react";
import "./SecResources.css";
import {
  getAllResources,
  createResource,
  deleteResource,
  updateResource,
} from "../../../services/ApiService";

const SecResources = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSection, setActiveSection] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewResourceForm, setShowNewResourceForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    type: "",
  });
  const [editResource, setEditResource] = useState({
    title: "",
    description: "",
    type: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [editSelectedFile, setEditSelectedFile] = useState(null);

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
          },
        ],
      });
    }
    return acc;
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleCancel = () => {
    setShowNewResourceForm(false);
    setNewResource({ title: "", description: "", type: "" });
    setSelectedFile(null);
  };

  const handleNewResourceSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create FormData object
      const formData = new FormData();
      formData.append("title", newResource.title);
      formData.append("description", newResource.description);
      formData.append("type", newResource.type);

      // Add file if selected
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const response = await createResource(formData);
      if (response.error) {
        throw new Error(response.error);
      }
      // Refresh resources
      const updatedResources = await getAllResources();
      setResources(updatedResources);
      setShowNewResourceForm(false);
      setNewResource({ title: "", description: "", type: "" });
      setSelectedFile(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (window.confirm("Are you sure you want to delete this resource?")) {
      try {
        const response = await deleteResource(resourceId);
        if (response.error) {
          throw new Error(response.error);
        }
        // Refresh resources
        const updatedResources = await getAllResources();
        setResources(updatedResources);
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    setEditSelectedFile(file);
  };

  const handleEditResource = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", editResource.title);
      formData.append("description", editResource.description);
      formData.append("type", editResource.type);

      // Add file if selected
      if (editSelectedFile) {
        formData.append("file", editSelectedFile);
      }

      const response = await updateResource(editingResource.id, formData);
      if (response.error) {
        throw new Error(response.error);
      }
      // Refresh resources
      const updatedResources = await getAllResources();
      setResources(updatedResources);
      setEditingResource(null);
      setEditResource({ title: "", description: "", type: "" });
      setEditSelectedFile(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditCancel = () => {
    setEditingResource(null);
    setEditResource({ title: "", description: "", type: "" });
    setEditSelectedFile(null);
  };

  const startEditing = (resource, category) => {
    setEditingResource(resource);
    setEditResource({
      title: resource.title,
      description: resource.content,
      type: category.title,
    });
  };

  if (loading) {
    return (
      <div className="sec-resources-container">
        <div className="sec-resources-header">
          <h1 className="sec-resources-heading">Secretary Resources</h1>
          <button
            className="sec-resources-newResourceBtn"
            onClick={() => setShowNewResourceForm(true)}
          >
            + New Resource
          </button>
        </div>
        <div className="sec-resources-loading">Loading resources...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sec-resources-container">
        <div className="sec-resources-header">
          <h1 className="sec-resources-heading">Secretary Resources</h1>
          <button
            className="sec-resources-newResourceBtn"
            onClick={() => setShowNewResourceForm(true)}
          >
            + New Resource
          </button>
        </div>
        <div className="sec-resources-error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="sec-resources-container">
      <div className="sec-resources-header">
        <h1 className="sec-resources-heading">Secretary Resources</h1>
        <button
          className="sec-resources-newResourceBtn"
          onClick={() => setShowNewResourceForm(true)}
        >
          + New Resource
        </button>
      </div>

      {showNewResourceForm && (
        <div className="sec-resources-newResourceForm">
          <h2>Create New Resource</h2>
          <form onSubmit={handleNewResourceSubmit}>
            <div className="sec-resources-formGroup">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                value={newResource.title}
                onChange={(e) =>
                  setNewResource({ ...newResource, title: e.target.value })
                }
                required
              />
            </div>
            <div className="sec-resources-formGroup">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={newResource.description}
                onChange={(e) =>
                  setNewResource({
                    ...newResource,
                    description: e.target.value,
                  })
                }
                required
              />
            </div>
            <div className="sec-resources-formGroup">
              <label htmlFor="type">Type</label>
              <input
                type="text"
                id="type"
                value={newResource.type}
                onChange={(e) =>
                  setNewResource({ ...newResource, type: e.target.value })
                }
                required
              />
            </div>
            <div className="sec-resources-formGroup">
              <label htmlFor="file">File (Optional)</label>
              <input type="file" id="file" onChange={handleFileChange} />
              {selectedFile && <p>Selected file: {selectedFile.name}</p>}
            </div>
            <div className="sec-resources-formActions">
              <button type="button" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit">Create Resource</button>
            </div>
          </form>
        </div>
      )}

      {editingResource && (
        <div className="sec-resources-editForm">
          <h2>Edit Resource</h2>
          <form onSubmit={handleEditResource}>
            <div className="sec-resources-formGroup">
              <label htmlFor="edit-title">Title</label>
              <input
                type="text"
                id="edit-title"
                value={editResource.title}
                onChange={(e) =>
                  setEditResource({ ...editResource, title: e.target.value })
                }
                required
              />
            </div>
            <div className="sec-resources-formGroup">
              <label htmlFor="edit-description">Description</label>
              <textarea
                id="edit-description"
                value={editResource.description}
                onChange={(e) =>
                  setEditResource({
                    ...editResource,
                    description: e.target.value,
                  })
                }
                required
              />
            </div>
            <div className="sec-resources-formGroup">
              <label htmlFor="edit-type">Type</label>
              <input
                type="text"
                id="edit-type"
                value={editResource.type}
                onChange={(e) =>
                  setEditResource({ ...editResource, type: e.target.value })
                }
                required
              />
            </div>
            <div className="sec-resources-formGroup">
              <label htmlFor="edit-file">File (Optional)</label>
              <input
                type="file"
                id="edit-file"
                onChange={handleEditFileChange}
              />
              {editSelectedFile && (
                <p>Selected file: {editSelectedFile.name}</p>
              )}
              {editingResource.fileName && !editSelectedFile && (
                <p>Current file: {editingResource.fileName}</p>
              )}
            </div>
            <div className="sec-resources-formActions">
              <button type="button" onClick={handleEditCancel}>
                Cancel
              </button>
              <button type="submit">Update Resource</button>
            </div>
          </form>
        </div>
      )}

      <div className="sec-resources-searchWrapper">
        <input
          type="text"
          placeholder="Search for a topic..."
          className="sec-resources-searchInput"
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
          <div className="sec-resources-category" key={catIndex}>
            <div
              className="sec-resources-categoryHeader"
              onClick={() => toggleCategory(catIndex)}
            >
              <span className="sec-resources-categoryTitle">
                {category.title}
              </span>
              <span className="sec-resources-icon">
                {activeCategory === catIndex ? "−" : "+"}
              </span>
            </div>

            {activeCategory === catIndex && (
              <div className="sec-resources-sectionList">
                {filteredSections.map((section, secIndex) => {
                  const isOpen = activeSection[catIndex] === secIndex;
                  return (
                    <div className="sec-resources-section" key={section.id}>
                      <div
                        className="sec-resources-sectionHeader"
                        onClick={() => toggleSection(catIndex, secIndex)}
                      >
                        <span className="sec-resources-sectionTitle">
                          {section.title}
                        </span>
                        <div className="sec-resources-sectionActions">
                          <button
                            className="sec-resources-editBtn"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing(section, category);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="sec-resources-deleteBtn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteResource(section.id);
                            }}
                          >
                            Delete
                          </button>
                          <span className="sec-resources-icon">
                            {isOpen ? "−" : "+"}
                          </span>
                        </div>
                      </div>
                      {isOpen && (
                        <div className="sec-resources-content">
                          <p className="sec-resources-paragraph">
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

export default SecResources;
