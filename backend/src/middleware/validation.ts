import { Request, Response, NextFunction } from 'express';

/**
 * Validate query parameters for building filters
 */
export function validateBuildingFilters(req: Request, res: Response, next: NextFunction) {
  const {
    year_built_min,
    year_built_max,
    floors_min,
    floors_max,
    violation_count_min,
    score_min,
    limit,
    offset
  } = req.query;

  // Validate year_built_min
  if (year_built_min && (isNaN(Number(year_built_min)) || Number(year_built_min) < 1800)) {
    return res.status(400).json({ 
      error: 'Invalid year_built_min. Must be a number greater than 1800' 
    });
  }

  // Validate year_built_max
  if (year_built_max && (isNaN(Number(year_built_max)) || Number(year_built_max) > new Date().getFullYear())) {
    return res.status(400).json({ 
      error: `Invalid year_built_max. Must be a number not greater than ${new Date().getFullYear()}` 
    });
  }

  // Validate floors_min
  if (floors_min && (isNaN(Number(floors_min)) || Number(floors_min) < 1)) {
    return res.status(400).json({ 
      error: 'Invalid floors_min. Must be a positive number' 
    });
  }

  // Validate floors_max
  if (floors_max && (isNaN(Number(floors_max)) || Number(floors_max) < 1)) {
    return res.status(400).json({ 
      error: 'Invalid floors_max. Must be a positive number' 
    });
  }

  // Validate violation_count_min
  if (violation_count_min && (isNaN(Number(violation_count_min)) || Number(violation_count_min) < 0)) {
    return res.status(400).json({ 
      error: 'Invalid violation_count_min. Must be a non-negative number' 
    });
  }

  // Validate score_min
  if (score_min && (isNaN(Number(score_min)) || Number(score_min) < 0 || Number(score_min) > 100)) {
    return res.status(400).json({ 
      error: 'Invalid score_min. Must be a number between 0 and 100' 
    });
  }

  // Validate limit
  if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
    return res.status(400).json({ 
      error: 'Invalid limit. Must be a number between 1 and 100' 
    });
  }

  // Validate offset
  if (offset && (isNaN(Number(offset)) || Number(offset) < 0)) {
    return res.status(400).json({ 
      error: 'Invalid offset. Must be a non-negative number' 
    });
  }

  // Validate sort_order
  if (req.query.sort_order && !['asc', 'desc'].includes(req.query.sort_order as string)) {
    return res.status(400).json({ 
      error: 'Invalid sort_order. Must be either "asc" or "desc"' 
    });
  }

  // Validate borough
  const validBoroughs = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];
  if (req.query.borough && !validBoroughs.includes(req.query.borough as string)) {
    return res.status(400).json({ 
      error: `Invalid borough. Must be one of: ${validBoroughs.join(', ')}` 
    });
  }

  next();
}

/**
 * Generic error handler middleware
 */
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('Error:', err);

  if (err.code === '23505') {
    // Unique violation
    return res.status(409).json({ 
      error: 'Duplicate entry. This record already exists.' 
    });
  }

  if (err.code === '23503') {
    // Foreign key violation
    return res.status(400).json({ 
      error: 'Invalid reference. The referenced record does not exist.' 
    });
  }

  if (err.code === '22P02') {
    // Invalid text representation
    return res.status(400).json({ 
      error: 'Invalid input format.' 
    });
  }

  // Default error response
  res.status(500).json({ 
    error: 'An unexpected error occurred. Please try again later.' 
  });
}