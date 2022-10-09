
import { ProgressBar } from 'react-loader-spinner'

import React from 'react'

const Loader = ({ color }) => {
    return (
        <div>
            <ProgressBar
                height="80"
                width="80"
                ariaLabel="progress-bar-loading"
                wrapperStyle={{}}
                wrapperClass="progress-bar-wrapper"
                borderColor='#222222'
                barColor={color}
            />
        </div>
    )
}

export default Loader