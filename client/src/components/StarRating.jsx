import React from 'react';
import { Box, IconButton } from '@mui/material';
import { Star, StarBorder } from '@mui/icons-material';

function StarRating({ value = 0, onChange = null, readOnly = false, size = "medium" }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <IconButton
                    key={star}
                    size={size}
                    onClick={onChange && !readOnly ? () => onChange(star) : undefined}
                    disabled={readOnly}
                    sx={{ color: '#FFD700', p: 0.5 }}
                >
                    {value >= star ? <Star /> : <StarBorder />}
                </IconButton>
            ))}
        </Box>
    );
}

export default StarRating;