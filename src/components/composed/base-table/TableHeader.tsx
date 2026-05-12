import styles from './TableHeader.module.scss';
import Col from "../layout/Col";
import Row from "../layout/Row";

type TableHeaderProps = {
    color?: string;
    bgColor?: string;
    heading: string;
};

export default function TableHeader({ color = '#000000', bgColor = '#ffffff', heading }: TableHeaderProps) {
    return (
        <>
            <Row
                style={
                    {
                        color: color,
                        fontSize: "25px",
                        backgroundColor: bgColor
                    }
                }
                className={styles.tableHeader}
            >
                <Col>{heading}</Col>
            </Row>
        </>
    );
}
