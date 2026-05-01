import React, { useState, useEffect } from 'react';
//import clonedeep from 'lodash.clonedeep';

export default function GenericCustomTable(props) {

    const [currentTableData, setCurrentTableData] = useState(props.data || undefined);
    const [columnsToDisplay, setColumnsToDisplay] = useState(props.columns || undefined);

    useEffect(() => {
        setCurrentTableData(props.data);
        setColumnsToDisplay(props.columns);
    }, [props.data, props.columns])

    const renderHeaders = () => {
        return columnsToDisplay.map((item, index) => {
            const headerCssClassName = `col-md-${item.columnSize}`;
            if (item.visible) {
                return (
                    <div className={headerCssClassName} key={index}>
                        <span className="table-column-header-text">{item.displayText}</span>
                    </div>
                );
            } else {
                return (
                    <div className={headerCssClassName} key={index} hidden>
                        <span className="table-column-header-text">{item.displayText}</span>
                    </div>
                );
            }
        });
    };

    const renderIndividualRow = (data, dataKeys) => {
        return dataKeys.map((item, index) => {
            let columnWidth = `col-md-${columnsToDisplay[index].columnSize}`;
            if (item.visible) {
                if (item.renderer) {
                    return (
                        <div className={columnWidth} key={index}>
                            {item.renderer(data, item.fieldName)}
                        </div>
                    );
                } else {
                    //console.log(item.fieldName);
                    //console.log(item.renderer);
                    return (
                        <div className={columnWidth} key={index}>
                            {data[item.fieldName]}
                        </div>
                    );
                }
            } else {
                
                return null;
            }
        });
    };

    const renderRows = () => {
        let dataKeys = /* clonedeep */ JSON.parse(JSON.stringify(columnsToDisplay));
        let dataRows = /* clonedeep */ JSON.parse(JSON.stringify(currentTableData));
        if (dataRows.length > 0) {
            return dataRows.map((row, index) => {
                return (
                    <div key={index} className="row">
                        {renderIndividualRow(row, dataKeys)}
                    </div>
                );
            });
        }
    }

    return (
        <div className="col-md-12">
            <div className="row column-header-row">
                {renderHeaders()}
            </div>
            {renderRows()}
        </div>
    );
}
