import React, { useRef } from "react";
import { DataTableRow, DataTableCell } from "@dhis2/ui";

import { useDrag, useDrop } from "react-dnd";
import classes from "../App.module.css";

const SortableDataRow = ({ option, moveRow, index }) => {
  const ref = useRef(null);
  const [{ handlerId }, drop] = useDrop({
    accept: "datatablerow",
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      moveRow(dragIndex, hoverIndex);

      item.index = hoverIndex;
    },
  });
  const [{ isDragging }, drag] = useDrag({
    type: "datatablerow",
    item: () => {
      return { id: option.id, index: index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));
  return (
    <DataTableRow
      className={isDragging ? classes.opacity : null}
      ref={ref}
      data-handler-id={handlerId}
      key={option.id}
      draggable
    >
      <DataTableCell>{option.displayName}</DataTableCell>
      <DataTableCell>{option.code}</DataTableCell>
      <DataTableCell>{option.id}</DataTableCell>
      <DataTableCell>{index}</DataTableCell>
    </DataTableRow>
  );
};

export default SortableDataRow;
