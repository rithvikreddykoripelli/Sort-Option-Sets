import React, { useState, useEffect } from "react";
import { useDataQuery } from "@dhis2/app-runtime";
import i18n from "@dhis2/d2-i18n";
import classes from "./App.module.css";

import {
  Center,
  CircularLoader,
  SingleSelectField,
  SingleSelectOption,
} from "@dhis2/ui";
import ListOptions from "./components/ListOptions";

const allOptionSetsQuery = {
  optionSets: {
    resource: "optionSets",
    params: {
      fields: "displayName,id",
      paging: "false",
    },
  },
};

const MyApp = () => {
  const [selectedOptionSet, setSelectedOptionSet] = useState("");
  const { loading, error, data } = useDataQuery(allOptionSetsQuery);

  return (
    <div className={classes.container}>
      {loading && (
        <Center>
          <CircularLoader />
        </Center>
      )}
      {error && <span>{`ERROR: ${error.message}`}</span>}
      {data && (
        <SingleSelectField
          label="Option Set"
          className={classes.select}
          filterable
          placeholder="Select Option Set"
          noMatchText="Option not found"
          onChange={(e) => setSelectedOptionSet(e.selected)}
          selected={selectedOptionSet}
        >
          {data.optionSets.optionSets.map((optionSet) => {
            return (
              <SingleSelectOption
                key={optionSet.id}
                label={optionSet.displayName}
                value={optionSet.id}
              />
            );
          })}
        </SingleSelectField>
      )}

      {selectedOptionSet && <ListOptions optionSetUid={selectedOptionSet} />}
    </div>
  );
};

export default MyApp;
