import React, { useEffect, useState, useCallback } from "react";
import update from "immutability-helper";
import _ from "lodash";
import {
  Button,
  ButtonStrip,
  DataTable,
  DataTableHead,
  DataTableRow,
  DataTableColumnHeader,
  DataTableCell,
  DataTableBody,
  CircularLoader,
  Center,
} from "@dhis2/ui";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { useDataQuery, useDataMutation, useAlert } from "@dhis2/app-runtime";

import classes from "../App.module.css";
import SortableDataRow from "./SortableDataRow";

const optionSetQuery = {
  optionSet: {
    resource: "optionSets",
    params: ({ optionSetUid }) => ({
      fields: "*,options[id,displayName,code]",
      filter: `id:eq:${optionSetUid}`,
    }),
  },
};

const updateOptionOrder = {
  type: "update",
  resource: "optionSets",
  id: ({ id }) => id,
  data: ({ optionSet }) => optionSet,
  params: {
    mergeMode: "REPLACE",
  },
};

const ListOptions = ({ optionSetUid }) => {
  const [optionSet, setOptionSet] = useState({});
  const [sortInstructions, setSortInstructions] = useState({
    column: "default",
    direction: true,
  });

  const { loading, error, data, refetch } = useDataQuery(optionSetQuery, {
    lazy: true,
    onComplete: (data) => setOptionSet(data?.optionSet?.optionSets[0]),
  });

  const [mutate, mutationResponse] = useDataMutation(updateOptionOrder);
  const { show } = useAlert(
    ({ optionSetName, status }) =>
      status
        ? `Option set ${optionSetName} saved successfully`
        : `Error saving option set ${optionSetName}`,
    ({ status }) =>
      status
        ? { success: true, duration: 3000 }
        : { critical: true, duration: 3000 }
  );

  const saveOptionSet = async () => {
    await mutate({ id: optionSetUid, optionSet: optionSet });
    if (mutationResponse.error)
      show({ status: false, optionSetName: optionSet.displayName });
    else show({ status: true, optionSetName: optionSet.displayName });
  };

  const moveRow = useCallback((dragIndex, hoverIndex) => {
    setOptionSet((prev) => {
      const tmp = update(prev, {
        options: {
          $splice: [
            [dragIndex - 1, 1],
            [hoverIndex - 1, 0, prev.options[dragIndex - 1]],
          ],
        },
      });
      return tmp;
    });
  }, []);

  useEffect(() => {
    refetch({ optionSetUid: optionSetUid });
  }, [optionSetUid]);

  useEffect(() => {
    if (optionSetUid != null) {
      let optionSorted = _.chain(optionSet?.options)
        .cloneDeep()
        .map((option) => {
          option[sortInstructions.column] = isNaN(
            option[sortInstructions.column]
          )
            ? option[sortInstructions.column]
            : eval(option[sortInstructions.column]);
          return option;
        })
        .orderBy(
          sortInstructions.column,
          sortInstructions.direction ? "asc" : "desc"
        )
        .value();
      const tmp = _.cloneDeep(optionSet);
      tmp.options = optionSorted;
      setOptionSet(tmp);
    }
  }, [sortInstructions]);

  const onSort = (columnName) => {
    setSortInstructions((prev) => ({
      column: columnName,
      direction: prev.column === columnName ? !prev.direction : true,
    }));
  };

  return (
    <>
      <ButtonStrip className={classes.actions} middle>
        <Button onClick={() => onSort("displayName")}>Sort By Name</Button>
        <Button onClick={() => onSort("code")}>Sort By Code</Button>
        <Button onClick={saveOptionSet} primary>
          Save Order
        </Button>
      </ButtonStrip>
      {loading ? (
        <Center position="top">
          <CircularLoader />
        </Center>
      ) : (
        <DataTable>
          <DataTableHead>
            <DataTableRow>
              <DataTableColumnHeader />
              <DataTableColumnHeader name="displayName">
                Name
              </DataTableColumnHeader>
              <DataTableColumnHeader name="code">Code</DataTableColumnHeader>
              <DataTableColumnHeader>ID</DataTableColumnHeader>
              <DataTableColumnHeader>Sort Order</DataTableColumnHeader>
            </DataTableRow>
          </DataTableHead>
          <DataTableBody>
            {optionSet.options && (
              <DndProvider backend={HTML5Backend}>
                {optionSet?.options?.map((option, index) => {
                  return (
                    <SortableDataRow
                      moveRow={moveRow}
                      option={option}
                      key={option.id}
                      index={index + 1}
                    />
                  );
                })}
              </DndProvider>
            )}
          </DataTableBody>
        </DataTable>
      )}
    </>
  );
};

export default ListOptions;
