import React from 'react';
import {Link} from 'react-router-dom';

export default () => {
  return (
    <div>You look lost.
    <Link to="/"> Back to home page!</Link>
    </div>
  );
};
