import { render } from "@testing-library/react";
import { SquareGameContainer } from "../SquareGameContainer";

describe('<SquareGameContainer />', () => {
    const setupRTL = () => {
        return render(
            <SquareGameContainer />
        );
    };

    test('should render react element', () => {
        const { getByTestId } = setupRTL();
        expect(getByTestId('canvas')).toBeInTheDocument();
    });
});