import React from 'react';
// import PropTypes from 'prop-types';

import UserPanel from './UserPanel';
import CoursePanel from './CoursePanel';
import AssignmentPanel from './AssignmentPanel';
import * as api from "../api";

class App extends React.Component {
  constructor() {
    super();

    this.state = {
      courses: [ ],
      users:   { },
      asgmt_grps:  [ ],
      view: ""
    };

    this.selectCourse = this.selectCourse.bind(this);
  }

  componentDidMount() {
    api.fetchCourses()
      .then((courses) => {
        console.log(JSON.stringify(courses));
        this.setState({ courses });
      });
  }

  selectCourse(key) {
    /*api.fetchCourseUsers(key)
      .then((users) => {
        this.setState({ users });
      });
    api.fetchCourseAssignments(key)
      .then((asgmt_grps) => {
        this.setState({ asgmt_grps });
      });*/
  }

  render() {
    return (
      <div className="myclass-shell">
        <div className="myclass-container">
          <div className="myclass-header">
            <h4>MyClass</h4>
          </div>
          <div className="myclass-contents">
            <CoursePanel
              courses={this.state.courses}
              selectCourse={this.selectCourse}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default App;