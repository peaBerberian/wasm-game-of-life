mod utils;

use std::fmt;
use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Cell {
    Dead = 0,
    Alive = 1,
}

#[wasm_bindgen]
pub struct Universe {
    width: u32,
    height: u32,
    current_cells: Vec<Cell>,
    next_cells: Vec<Cell>,
}

/// Public methods, exported to JavaScript.
#[wasm_bindgen]
impl Universe {
    pub fn new(height: u32, width: u32) -> Universe {
        utils::set_panic_hook();
        let current_cells = vec![Cell::Dead; (width * height) as usize];
        let next_cells = vec![Cell::Dead; (width * height) as usize];
        Universe {
            width,
            height,
            current_cells,
            next_cells,
        }
    }

    pub fn toggle_cell(&mut self, row : u32, column : u32) {
        let index = self.get_index(row, column);
        self.current_cells[index] = match self.current_cells[index] {
            Cell::Dead => Cell::Alive,
            Cell::Alive => Cell::Dead
        };
    }

    pub fn width(&self) -> u32 {
        self.width
    }

    pub fn height(&self) -> u32 {
        self.height
    }

    pub fn get_cells_ptr(&self) -> *const Cell {
        self.current_cells.as_ptr()
    }

    fn get_current_next_cells(&mut self) -> (&Vec<Cell>, &mut Vec<Cell>) {
        (&self.current_cells, &mut self.next_cells)
    }

    pub fn tick(&mut self) {
        let height = self.height;
        let width = self.width;
        let (ref current_cells, ref mut next_cells) :
            (&Vec<Cell>, &mut Vec<Cell>) = (self.current_cells.as_ref(), self.next_cells.as_mut());
        for row in 0..height {
            for col in 0..width {
                let idx = self.get_index(row, col);
                let cell = current_cells[idx];
                let live_neighbors = self.live_neighbor_count(row, col);

                let next_cell = match (cell, live_neighbors) {
                    // Rule 1: Any live cell with fewer than two live neighbours
                    // dies, as if caused by underpopulation.
                    (Cell::Alive, x) if x < 2 => Cell::Dead,
                    // Rule 2: Any live cell with two or three live neighbours
                    // lives on to the next generation.
                    (Cell::Alive, 2) | (Cell::Alive, 3) => Cell::Alive,
                    // Rule 3: Any live cell with more than three live
                    // neighbours dies, as if by overpopulation.
                    (Cell::Alive, x) if x > 3 => Cell::Dead,
                    // Rule 4: Any dead cell with exactly three live neighbours
                    // becomes a live cell, as if by reproduction.
                    (Cell::Dead, 3) => Cell::Alive,
                    // All other cells remain in the same state.
                    (otherwise, _) => otherwise,
                };

                next_cells[idx] = next_cell;
            }
        }
    }

    fn get_index(&self, row: u32, column: u32) -> usize {
        (row * self.width + column) as usize
    }

    fn live_neighbor_count(&self, row: u32, column: u32) -> u8 {
        let mut count = 0;

        let cell_up = self.get_next_row_up_wrapping(row);
        let cell_down = self.get_next_row_down_wrapping(row);
        let cell_left = self.get_next_column_left_wrapping(column);
        let cell_right = self.get_next_column_right_wrapping(column);

        let nw = self.get_index(cell_up, cell_left);
        count += self.current_cells[nw] as u8;

        let n = self.get_index(cell_up, column);
        count += self.current_cells[n] as u8;

        let ne = self.get_index(cell_up, cell_right);
        count += self.current_cells[ne] as u8;

        let w = self.get_index(row, cell_left);
        count += self.current_cells[w] as u8;

        let e = self.get_index(row, cell_right);
        count += self.current_cells[e] as u8;

        let sw = self.get_index(cell_down, cell_left);
        count += self.current_cells[sw] as u8;

        let s = self.get_index(cell_down, column);
        count += self.current_cells[s] as u8;

        let se = self.get_index(cell_down, cell_right);
        count += self.current_cells[se] as u8;

        count
    }

    /// Get the next row on top of the given row, while wrapping to the last row
    /// when reaching the top of the first row.
    #[inline(always)]
    fn get_next_row_up_wrapping(&self, row: u32) -> u32 {
        if row == 0 {
            self.height - 1
        } else {
            row - 1
        }
    }

    /// Get the Nth row on the bottom of the given row, while wrapping to the
    /// first row when reaching the bottom of the last row.
    /// /!\ You should first ensure that the given `down` parameter is inferior
    /// to `self.height` to avoid the returned value to overflow.
    #[inline(always)]
    fn get_next_row_down_wrapping(&self, row: u32) -> u32 {
        if row == self.height - 1 {
            0
        } else {
            row + 1
        }
    }

    /// Get the Nth column on the left of the given column, while wrapping to
    /// the last column when reaching the left of the first column.
    /// /!\ You should first ensure that the given `left` parameter is inferior
    /// to `self.width` to avoid the returned value to overflow.
    #[inline(always)]
    fn get_next_column_left_wrapping(&self, column: u32) -> u32 {
        if column == 0 {
            self.width - 1
        } else {
            column - 1
        }
    }

    /// Get the Nth column on the right of the given column, while wrapping to
    /// the first column when reaching the right of the last column.
    /// /!\ You should first ensure that the given `right` parameter is inferior
    /// to `self.width` to avoid the returned value to overflow.
    #[inline(always)]
    fn get_next_column_right_wrapping(&self, column: u32) -> u32 {
        if column >= self.width - 1 {
            0
        } else {
            column + 1
        }
    }

    /// Get the Nth row on top of the given row, while wrapping to the last row
    /// when reaching the top of the first row.
    /// /!\ You should first ensure that the given `up` parameter is inferior to
    /// `self.height` to avoid the returned value to overflow.
    #[inline(always)]
    fn get_row_up_wrapping(&self, row: u32, up: u32) -> u32 {
        if row < up {
            self.height - up
        } else {
            row - up
        }
    }

    /// Get the Nth row on the bottom of the given row, while wrapping to the
    /// first row when reaching the bottom of the last row.
    /// /!\ You should first ensure that the given `down` parameter is inferior
    /// to `self.height` to avoid the returned value to overflow.
    #[inline(always)]
    fn get_row_down_wrapping(&self, row: u32, down : u32) -> u32 {
        if row >= self.height - down {
            row - (self.height - down)
        } else {
            row + down
        }
    }

    /// Get the Nth column on the left of the given column, while wrapping to
    /// the last column when reaching the left of the first column.
    /// /!\ You should first ensure that the given `left` parameter is inferior
    /// to `self.width` to avoid the returned value to overflow.
    #[inline(always)]
    fn get_column_left_wrapping(&self, column: u32, left: u32) -> u32 {
        if column < left {
            self.width - (left - column)
        } else {
            column - left
        }
    }

    /// Get the Nth column on the right of the given column, while wrapping to
    /// the first column when reaching the right of the last column.
    /// /!\ You should first ensure that the given `right` parameter is inferior
    /// to `self.width` to avoid the returned value to overflow.
    #[inline(always)]
    fn get_column_right_wrapping(&self, column: u32, right: u32) -> u32 {
        if column >= self.width - right {
            column - (self.width - right)
        } else {
            column + right
        }
    }

    pub fn make_glider(&mut self, row: u32, column: u32) {
        let cell_up = self.get_row_up_wrapping(row, 1);
        let cell_down = self.get_row_down_wrapping(row, 1);
        let cell_left = if column == 0 { self.width - 1 } else { column - 1 };
        let cell_right = if column == self.width - 1 { 0 } else { column + 1 };
        let glider_cells_indices = [
            self.get_index(cell_up, column),
            self.get_index(row, cell_right),

            self.get_index(cell_down, cell_left),
            self.get_index(cell_down, column),
            self.get_index(cell_down, cell_right),
        ];

        for &cell_idx in glider_cells_indices.iter() {
            self.current_cells[cell_idx] = Cell::Alive;
        }
    }

    pub fn make_pulsar(&mut self, row: u32, column: u32) {
        let up_6 = self.get_row_up_wrapping(row, 6);
        let up_4 = self.get_row_up_wrapping(row, 4);
        let up_3 = self.get_row_up_wrapping(row, 3);
        let up_2 = self.get_row_up_wrapping(row, 2);
        let up_1 = self.get_row_up_wrapping(row, 1);

        let down_6 = self.get_row_down_wrapping(row, 6);
        let down_4 = self.get_row_down_wrapping(row, 4);
        let down_3 = self.get_row_down_wrapping(row, 3);
        let down_2 = self.get_row_down_wrapping(row, 2);
        let down_1 = self.get_row_down_wrapping(row, 1);

        let left_6 = self.get_column_left_wrapping(column, 6);
        let left_4 = self.get_column_left_wrapping(column, 4);
        let left_3 = self.get_column_left_wrapping(column, 3);
        let left_2 = self.get_column_left_wrapping(column, 2);
        let left_1 = self.get_column_left_wrapping(column, 1);

        let right_6 = self.get_column_right_wrapping(column, 6);
        let right_4 = self.get_column_right_wrapping(column, 4);
        let right_3 = self.get_column_right_wrapping(column, 3);
        let right_2 = self.get_column_right_wrapping(column, 2);
        let right_1 = self.get_column_right_wrapping(column, 1);
        let pulsar_cells_indices = [
            self.get_index(up_6, left_4),
            self.get_index(up_6, left_3),
            self.get_index(up_6, left_2),

            self.get_index(up_6, right_2),
            self.get_index(up_6, right_3),
            self.get_index(up_6, right_4),

            self.get_index(up_4, left_6),
            self.get_index(up_4, left_1),
            self.get_index(up_4, right_1),
            self.get_index(up_4, right_6),

            self.get_index(up_3, left_6),
            self.get_index(up_3, left_1),
            self.get_index(up_3, right_1),
            self.get_index(up_3, right_6),

            self.get_index(up_2, left_6),
            self.get_index(up_2, left_1),
            self.get_index(up_2, right_1),
            self.get_index(up_2, right_6),

            self.get_index(up_1, left_4),
            self.get_index(up_1, left_3),
            self.get_index(up_1, left_2),
            self.get_index(up_1, right_2),
            self.get_index(up_1, right_3),
            self.get_index(up_1, right_4),

            self.get_index(down_1 ,left_4),
            self.get_index(down_1, left_3),
            self.get_index(down_1, left_2),
            self.get_index(down_1, right_2),
            self.get_index(down_1, right_3),
            self.get_index(down_1, right_4),

            self.get_index(down_2, left_6),
            self.get_index(down_2, left_1),
            self.get_index(down_2, right_1),
            self.get_index(down_2, right_6),

            self.get_index(down_3, left_6),
            self.get_index(down_3, left_1),
            self.get_index(down_3, right_1),
            self.get_index(down_3, right_6),

            self.get_index(down_4, left_6),
            self.get_index(down_4, left_1),
            self.get_index(down_4, right_1),
            self.get_index(down_4, right_6),

            self.get_index(down_6, left_4),
            self.get_index(down_6, left_3),
            self.get_index(down_6, left_2),
            self.get_index(down_6, right_2),
            self.get_index(down_6, right_3),
            self.get_index(down_6, right_4),
        ];

        for &cell_idx in pulsar_cells_indices.iter() {
            self.current_cells[cell_idx] = Cell::Alive;
        }
    }

    // ...
}

// Specific methods used for tests
impl Universe {
    /// Get the dead and alive values of the entire universe.
    pub fn get_cells(&self) -> &[Cell] {
        &self.current_cells
    }

    /// Set cells to be alive in a universe by passing the row and column
    /// of each cell as an array.
    pub fn set_cells(&mut self, cells: &[(u32, u32)]) {
        for (row, col) in cells.iter().cloned() {
            let idx = self.get_index(row, col);
            // XXX TODO
            self.current_cells[idx] = Cell::Alive;
        }
    }

}

impl fmt::Display for Universe {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        let cells = &self.current_cells;
        for line in cells.as_slice().chunks(self.width as usize) {
            for &cell in line {
                let symbol = if cell == Cell::Dead { '◻' } else { '◼' };
                write!(f, "{}", symbol)?;
            }
            write!(f, "\n")?;
        }

        Ok(())
    }
}
